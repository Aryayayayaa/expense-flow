"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/constants/currencies";

import {
  createExpenseAction,
  updateExpenseAction,
  saveOcrReceiptAction,
} from "../actions/expense-actions";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

import { DEFAULT_CATEGORIES } from "@/constants/categories";

import { SerializedExpense } from "../types";
import type { OcrResult } from "../types/ocr";
import ReceiptOcrUpload from "./ReceiptOcrUpload";

type AddExpenseFormProps = {
  editingExpense: SerializedExpense | null;
  setEditingExpense: React.Dispatch<
    React.SetStateAction<SerializedExpense | null>
  >;
};

const initialState = {
  success: false,
  errors: {} as Record<string, string[]>,
  message: "",
  expenseId: undefined as number | undefined,
};

export default function AddExpenseForm({
  editingExpense,
  setEditingExpense,
}: AddExpenseFormProps) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [customCategory, setCustomCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  function getCurrentDateTime() {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  function resetForm() {
    setTitle("");
    setAmount("");
    setSelectedCategory("");
    setCustomCategory("");

    setOcrResult(null);
    setReceiptFile(null);

    setExpenseDate(getCurrentDateTime());

    setEditingExpense(null);
    formRef.current?.reset();
    setState(initialState);

    setCurrency(DEFAULT_CURRENCY);
  }

  useEffect(() => {
    if (!editingExpense) {
      return;
    }

    setState(initialState);

    setTitle(editingExpense.title);
    setAmount(String(editingExpense.amount));

    if (
      (DEFAULT_CATEGORIES as readonly string[]).includes(
        editingExpense.category,
      )
    ) {
      setSelectedCategory(editingExpense.category);
      setCustomCategory("");
    } else {
      setSelectedCategory("Other");
      setCustomCategory(editingExpense.category);
    }

    setCurrency(
      SUPPORTED_CURRENCIES.some((item) => item.code === editingExpense.currency)
        ? (editingExpense.currency as CurrencyCode)
        : DEFAULT_CURRENCY,
    );

    const date = new Date(
      editingExpense.expenseDate ?? editingExpense.createdAt,
    );

    setExpenseDate(
      new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );

    /*
     * Editing an existing expense must never carry over
     * OCR information from a previously selected receipt.
     */
    setOcrResult(null);
    setReceiptFile(null);

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [editingExpense]);

  /*
   * Apply OCR results to the form.
   */
  useEffect(() => {
    if (!ocrResult) {
      return;
    }

    if (ocrResult.vendor) {
      setTitle(ocrResult.vendor);
    }

    if (ocrResult.amount !== null) {
      setAmount(String(ocrResult.amount));
    }

    if (ocrResult.expenseDate) {
      setExpenseDate(ocrResult.expenseDate);
    }
  }, [ocrResult]);

  /*
   * Upload the original receipt and save its metadata.
   * This is deliberately kept separate from OCR extraction.
   * OCR can fail while the original receipt can still be saved.
   */
  async function saveOriginalReceipt(
    expenseId: number,
    file: File,
    rawText: string,
  ) {
    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "application/pdf": "pdf",
    };

    const extension = extensionMap[file.type] ?? "bin";

    const safePath = `expenses/${expenseId}/original-receipt-${Date.now()}.${extension}`;

    const blob = await upload(safePath, file, {
      access: "private",
      handleUploadUrl: "/api/upload",
      clientPayload: JSON.stringify({
        expenseId,
        type: "ocr-receipt",
      }),
    });

    const saveResult = await saveOcrReceiptAction(
      expenseId,
      blob.url,
      blob.pathname,
      rawText,
    );

    if (!saveResult.success) {
      throw new Error(saveResult.message);
    }
  }

  return (
    <Card>
      <form
        ref={formRef}
        action={async (formData) => {
          setPending(true);

          try {
            let result;

            /*
             * ---------------------------------------------------------
             * EDIT EXISTING EXPENSE
             * ---------------------------------------------------------
             *
             * Editing never changes or uploads an OCR receipt.
             */
            if (editingExpense) {
              result = await updateExpenseAction(editingExpense.id, formData);

              setState(result);

              if (!result.success) {
                return;
              }
            } else {
              /*
               * -------------------------------------------------------
               * CREATE NEW EXPENSE
               * -------------------------------------------------------
               */
              result = await createExpenseAction(null, formData);

              if (!result.success) {
                setState(result);
                return;
              }

              /*
               * -------------------------------------------------------
               * SAVE ORIGINAL RECEIPT
               * -------------------------------------------------------
               *
               * The receipt is saved whenever a file was selected.
               *
               * This happens regardless of whether OCR succeeded.
               *
               * Therefore:
               *
               * OCR succeeds
               *   → expense fields are populated automatically
               *   → original receipt is saved
               *
               * OCR fails
               *   → user enters fields manually
               *   → original receipt is still saved
               */
              if (result.expenseId && receiptFile) {
                try {
                  await saveOriginalReceipt(
                    result.expenseId,
                    receiptFile,
                    ocrResult?.rawText ?? "",
                  );
                } catch (error) {
                  console.error("Original receipt storage error:", error);

                  setState({
                    ...result,
                    success: false,
                    message:
                      "Expense was created, but the original receipt could not be saved.",
                  });

                  return;
                }
              }

              setState(result);
            }

            /*
             * Reset the form after successful creation/update.
             */
            setTimeout(() => {
              resetForm();
            }, 1000);
          } catch (error) {
            console.error("Expense submission error:", error);

            setState({
              success: false,
              errors: {},
              message:
                "Expense was created, but the original receipt could not be saved.",
              expenseId: undefined,
            });
          } finally {
            setPending(false);
          }
        }}
        className="space-y-5 text-black"
      >
        <div className="border-b pb-4">
          <h2 className="text-2xl font-semibold">
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {editingExpense
              ? "Modify the details below and save your changes."
              : "Record a new expense to keep track of your spending."}
          </p>
        </div>

        {!editingExpense && (
          <ReceiptOcrUpload
            onOcrComplete={(result: OcrResult | null, file: File) => {
              setReceiptFile(file);
              setOcrResult(result);
            }}
          />
        )}

        <div className="space-y-1">
          <label className="mb-1 block">Title</label>

          <input
            disabled={pending}
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          {state.errors?.title && (
            <p className="text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-1 block">Amount</label>

          <input
            disabled={pending}
            name="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          {state.errors?.amount && (
            <p className="text-sm text-red-500">{state.errors.amount[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-1 block" htmlFor="expense-currency">
            Currency
          </label>

          <select
            id="expense-currency"
            disabled={pending}
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {SUPPORTED_CURRENCIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} — {item.name} ({item.symbol})
              </option>
            ))}
          </select>

          {state.errors?.currency && (
            <p className="text-sm text-red-500">{state.errors.currency[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-1 block">Category</label>

          <select
            disabled={pending}
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select Category</option>

            {DEFAULT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {selectedCategory === "Other" && (
            <div className="mt-4 space-y-1">
              <label className="mb-1 block">Enter Category</label>

              <input
                disabled={pending}
                name="customCategory"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. Photography"
              />
            </div>
          )}

          {state.errors?.category && (
            <p className="text-sm text-red-500">{state.errors.category[0]}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block">Expense Date & Time</label>

          <input
            disabled={pending}
            name="expenseDate"
            type="datetime-local"
            value={expenseDate || getCurrentDateTime()}
            max={getCurrentDateTime()}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white"
        >
          {pending
            ? "Saving..."
            : editingExpense
              ? "Update Expense"
              : "Save Expense"}
        </Button>

        {editingExpense && (
          <Button
            disabled={pending}
            type="button"
            variant="secondary"
            className="w-full"
            onClick={resetForm}
          >
            Cancel Editing
          </Button>
        )}

        {state.message && (
          <p
            className={`rounded p-3 ${
              state.success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>
    </Card>
  );
}
