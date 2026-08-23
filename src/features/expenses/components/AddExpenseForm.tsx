"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

import type { DisplayExpense } from "../types";
import type { OcrResult } from "../types/ocr";

import ReceiptOcrUpload from "./ReceiptOcrUpload";

type AddExpenseFormProps = {
  editingExpense: DisplayExpense | null;
  setEditingExpense: React.Dispatch<
    React.SetStateAction<DisplayExpense | null>
  >;
  defaultCurrency?: CurrencyCode;
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
  defaultCurrency = DEFAULT_CURRENCY,
}: AddExpenseFormProps) {
  const router = useRouter();

  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);

  const [customCategory, setCustomCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  /*
   * Return the current browser-local date/time in the exact format
   * required by <input type="datetime-local">.
   */
  function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /*
   * Convert the browser-local datetime-local value into an ISO
   * timestamp that contains the correct timezone offset.
   *
   * Example in India:
   *
   * 2026-08-23T23:57
   *
   * becomes approximately:
   *
   * 2026-08-23T18:27:00.000Z
   */
  function toIsoDateTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toISOString();
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

    setCurrency(defaultCurrency);
  }

  useEffect(() => {
    if (!editingExpense) {
      /*
       * When opening the create form, initialize the date/time
       * once instead of waiting for the input fallback.
       */
      if (!expenseDate) {
        setExpenseDate(getCurrentDateTime());
      }

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
        : defaultCurrency,
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
  }, [editingExpense, defaultCurrency]);

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
          if (pending) {
            return;
          }

          setPending(true);
          setState(initialState);

          try {
            /*
             * IMPORTANT:
             *
             * datetime-local has no timezone.
             *
             * Convert it before sending it to the server action.
             */
            if (expenseDate) {
              formData.set("expenseDate", toIsoDateTime(expenseDate));
            }

            let result;

            /*
             * ---------------------------------------------------------
             * EDIT EXISTING EXPENSE
             * ---------------------------------------------------------
             */
            if (editingExpense) {
              result = await updateExpenseAction(editingExpense.id, formData);

              setState(result);

              if (!result.success) {
                return;
              }

              setTimeout(() => {
                resetForm();
              }, 1000);

              return;
            }

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

            /*
             * -------------------------------------------------------
             * CREATION SUCCESS
             * -------------------------------------------------------
             */
            setState(result);

            router.push("/expenses");
          } catch (error) {
            console.error("Expense submission error:", error);

            setState({
              success: false,
              errors: {},
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to submit expense.",
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

        <div className="space-y-1">
          <label className="mb-1 block">Expense Date & Time</label>

          <input
            disabled={pending}
            name="expenseDate"
            type="datetime-local"
            value={expenseDate}
            max={getCurrentDateTime()}
            onChange={(e) => {
              setExpenseDate(e.target.value);

              /*
               * Clear the previous date validation error as soon
               * as the user changes the value.
               */
              if (state.errors?.expenseDate) {
                setState((previous) => ({
                  ...previous,
                  errors: {
                    ...previous.errors,
                    expenseDate: [],
                  },
                }));
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          {state.errors?.expenseDate && (
            <p className="text-sm text-red-500">
              {state.errors.expenseDate[0]}
            </p>
          )}

          <p className="text-xs text-gray-500">
            Expense date and time cannot be in the future.
          </p>
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
