"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/constants/currencies";

import { isSupportedReceiptMimeType } from "../lib/receipt-constants";
import { uploadReceiptFile } from "../lib/upload-receipt-client";

import {
  createExpenseAction,
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
   * ---------------------------------------------------------
   * CURRENT DATE/TIME
   * ---------------------------------------------------------
   *
   * Returns the browser-local date/time in the format required
   * by <input type="datetime-local">.
   *
   * Example:
   *
   * 2026-08-25T14:30
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
   * ---------------------------------------------------------
   * DATETIME → ISO
   * ---------------------------------------------------------
   *
   * The datetime-local input contains browser-local time.
   *
   * Convert it to an ISO timestamp before sending it
   * to the server.
   */
  function toIsoDateTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toISOString();
  }

  /*
   * ---------------------------------------------------------
   * RESET FORM
   * ---------------------------------------------------------
   */
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

  /*
   * ---------------------------------------------------------
   * LOAD EDITING EXPENSE
   * ---------------------------------------------------------
   *
   * When editingExpense changes from null → an expense,
   * populate the form with the existing expense values.
   */
  useEffect(() => {
    if (!editingExpense) {
      if (!expenseDate) {
        setExpenseDate(getCurrentDateTime());
      }

      return;
    }

    setState(initialState);

    setTitle(editingExpense.title);
    setAmount(String(editingExpense.amount));

    /*
     * Determine whether the category is one of the default
     * categories or a custom "Other" category.
     */
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

    /*
     * Restore the original currency.
     */
    setCurrency(
      SUPPORTED_CURRENCIES.some((item) => item.code === editingExpense.currency)
        ? (editingExpense.currency as CurrencyCode)
        : defaultCurrency,
    );

    /*
     * Restore the expense date/time.
     */
    const date = new Date(
      editingExpense.expenseDate ?? editingExpense.createdAt,
    );

    setExpenseDate(
      new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );

    /*
     * OCR receipt is not changed when editing.
     */
    setOcrResult(null);
    setReceiptFile(null);

    /*
     * Scroll the edit form into view.
     */
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [editingExpense, defaultCurrency, expenseDate]);

  /*
   * ---------------------------------------------------------
   * APPLY OCR RESULT
   * ---------------------------------------------------------
   *
   * When OCR completes, automatically populate:
   *
   * vendor      → title
   * amount      → amount
   * expenseDate → expense date
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
   * ---------------------------------------------------------
   * SAVE ORIGINAL RECEIPT
   * ---------------------------------------------------------
   *
   * This is used only when creating a NEW expense from
   * an OCR receipt.
   */
  async function saveOriginalReceipt(
    expenseId: number,
    file: File,
    rawText: string,
  ) {
    if (!isSupportedReceiptMimeType(file.type)) {
      throw new Error(
        "Unsupported receipt format. Please upload JPG, PNG, WEBP, or PDF.",
      );
    }

    const uploaded = await uploadReceiptFile(expenseId, file);

    const saveResult = await saveOcrReceiptAction(
      expenseId,
      uploaded.url,
      uploaded.path,
      rawText,
    );

    if (!saveResult.success) {
      throw new Error(saveResult.message);
    }
  }

  /*
   * ---------------------------------------------------------
   * HANDLE SUBMIT
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * CREATE:
   *
   *     POST /api/expenses
   *
   * UPDATE:
   *
   *     PATCH /api/expenses/:id
   *
   * We intentionally DO NOT call updateExpenseAction()
   * directly from the client.
   *
   * Calling a Server Action directly results in Next.js
   * making an internal POST request.
   *
   * Instead, the client calls our REST-style PATCH API route.
   */
  async function handleSubmit(formData: FormData) {
    if (pending) {
      return;
    }

    /*
     * Set loading before making any request.
     */
    setPending(true);
    setState(initialState);

    try {
      /*
       * Convert browser-local datetime to ISO.
       */
      if (expenseDate) {
        formData.set("expenseDate", toIsoDateTime(expenseDate));
      }

      let result;

      /*
       * =========================================================
       * EDIT EXISTING EXPENSE
       * =========================================================
       *
       * THIS IS THE IMPORTANT FIX.
       *
       * Before:
       *
       *     updateExpenseAction(...)
       *
       * which resulted in a POST.
       *
       * Now:
       *
       *     PATCH /api/expenses/:id
       */
      if (editingExpense) {
        const response = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PATCH",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setState({
            success: false,
            errors: data.errors ?? {},
            message: data.message ?? "Unable to update expense.",
            expenseId: undefined,
          });

          return;
        }

        result = data;

        setState(result);

        /*
         * Give the user a short moment to see the
         * successful update message.
         */
        setTimeout(() => {
          resetForm();
          router.refresh();
        }, 1000);

        return;
      }

      /*
       * =========================================================
       * CREATE NEW EXPENSE
       * =========================================================
       *
       * New expenses continue to use the Server Action.
       *
       * This is POST behavior.
       */
      result = await createExpenseAction(null, formData);

      if (!result.success) {
        setState(result);
        return;
      }

      /*
       * =========================================================
       * SAVE ORIGINAL OCR RECEIPT
       * =========================================================
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
       * =========================================================
       * CREATION SUCCESS
       * =========================================================
       */
      setState(result);

      router.push("/expenses");
    } catch (error) {
      console.error("Expense submission error:", error);

      setState({
        success: false,
        errors: {},
        message:
          error instanceof Error ? error.message : "Unable to submit expense.",
        expenseId: undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();

          if (pending) {
            return;
          }

          void handleSubmit(new FormData(event.currentTarget));
        }}
        className="space-y-5 text-black"
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

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

        {/* =====================================================
            OCR RECEIPT
        ====================================================== */}

        {!editingExpense && (
          <ReceiptOcrUpload
            onOcrComplete={(result: OcrResult | null, file: File) => {
              setReceiptFile(file);
              setOcrResult(result);
            }}
          />
        )}

        {/* =====================================================
            TITLE
        ====================================================== */}

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

        {/* =====================================================
            AMOUNT
        ====================================================== */}

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

        {/* =====================================================
            CURRENCY
        ====================================================== */}

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

        {/* =====================================================
            CATEGORY
        ====================================================== */}

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

        {/* =====================================================
            EXPENSE DATE
        ====================================================== */}

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

        {/* =====================================================
            LOADING
        ====================================================== */}

        {pending && (
          <div
            className="flex items-center justify-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700"
            role="status"
            aria-live="polite"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
              aria-hidden="true"
            />

            <span>
              {editingExpense ? "Updating expense..." : "Creating expense..."}
            </span>
          </div>
        )}

        {/* =====================================================
            SUBMIT BUTTON
        ====================================================== */}

        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white"
        >
          {pending
            ? editingExpense
              ? "Updating..."
              : "Creating..."
            : editingExpense
              ? "Update Expense"
              : "Save Expense"}
        </Button>

        {/* =====================================================
            CANCEL EDIT
        ====================================================== */}

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

        {/* =====================================================
            RESULT MESSAGE
        ====================================================== */}

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
