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

//import type { DisplayExpense } from "../types";
import type { OcrResult } from "../types/ocr";

import ReceiptOcrUpload from "./ReceiptOcrUpload";
import ReceiptViewerButton from "./ReceiptViewerButton";

export type EditableExpense = {
  id: number;
  title: string;
  amount: number;
  currency: string;
  category: string;
  expenseDate: Date | string | null;
  createdAt: Date | string;
  ocrReceiptUrl: string | null;
  ocrReceiptPath: string | null;
};

type AddExpenseFormProps = {
  editingExpense: EditableExpense | null;
  setEditingExpense: React.Dispatch<
    React.SetStateAction<EditableExpense | null>
  >;
  defaultCurrency?: CurrencyCode;
  onClose?: () => void;
  onSuccess?: () => void;
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
  onClose,
  onSuccess,
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
  const [replacingReceipt, setReplacingReceipt] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState("");
  const [receiptChanged, setReceiptChanged] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState<{
    url: string;
    path: string;
  } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  /*
   * Stores the original values when an existing expense is opened for editing.
   * This lets us determine whether the user actually changed anything before allowing an update request.
   */
  const originalEditValuesRef = useRef<{
    title: string;
    amount: number;
    currency: string;
    category: string;
    expenseDate: string;
  } | null>(null);

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
    originalEditValuesRef.current = null;
    setTitle("");
    setAmount("");
    setSelectedCategory("");
    setCustomCategory("");

    setOcrResult(null);
    setReceiptFile(null);
    setReplacingReceipt(false);
    setReceiptMessage("");

    setExpenseDate(getCurrentDateTime());

    setEditingExpense(null);

    formRef.current?.reset();

    setState(initialState);

    setCurrency(defaultCurrency);
  }

  /*
   * Convert an expense date into the same browser-local
   * datetime-local format used by the form.
   *
   * This prevents equivalent dates from being treated
   * as different merely because one is an ISO string
   * and the other is a datetime-local value.
   */
  function normalizeExpenseDate(
    value: Date | string | null,
    fallback: Date | string,
  ): string {
    const date = new Date(value ?? fallback);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
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

    //Restore the original currency.
    setCurrency(
      SUPPORTED_CURRENCIES.some((item) => item.code === editingExpense.currency)
        ? (editingExpense.currency as CurrencyCode)
        : defaultCurrency,
    );

    //Restore the expense date/time.
    const normalizedExpenseDate = normalizeExpenseDate(
      editingExpense.expenseDate,
      editingExpense.createdAt,
    );

    setExpenseDate(normalizedExpenseDate);

    //Capture the original values used to open the edit form.
    originalEditValuesRef.current = {
      title: editingExpense.title.trim(),
      amount: Number(editingExpense.amount),
      currency: editingExpense.currency,
      category: editingExpense.category.trim(),
      expenseDate: normalizedExpenseDate,
    };

    //OCR receipt is not changed when editing.
    setOcrResult(null);
    setReceiptFile(null);
    setReceiptChanged(false);
    setReceiptMessage("");
    setPendingReceipt(null);

    //Scroll the edit form into view.

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [editingExpense, defaultCurrency]);

  /* Determine whether an existing expense has actually changed.
   * No database/API update should happen when all editable
   * values are still identical to the original values.*/
  const hasChanges = editingExpense
    ? (() => {
        const original = originalEditValuesRef.current;

        if (!original) {
          return false;
        }

        const currentCategory =
          selectedCategory === "Other"
            ? customCategory.trim()
            : selectedCategory.trim();

        return (
          title.trim() !== original.title ||
          Number(amount) !== original.amount ||
          currency !== original.currency ||
          currentCategory !== original.category ||
          expenseDate !== original.expenseDate ||
          receiptChanged
        );
      })()
    : true;

  /* ---------------------------------------------------------
   * APPLY OCR RESULT
   * ---------------------------------------------------------
   * When OCR completes, automatically populate.
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

  async function handleSubmit(formData: FormData) {
    if (pending) {
      return;
    }

    if (editingExpense && !hasChanges) {
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
          onSuccess?.();
          onClose?.();
          router.refresh();
        }, 1200);

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
        setState({
          ...result,
          success: false,
          message:
            "Failed to save the expense. Please try again in a few minutes. Redirecting you to the Expenses page.",
        });

        setTimeout(() => {
          onClose?.();
          router.push("/expenses");
        }, 1500);

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
              "Failed to save the expense. Please try again in a few minutes. Redirecting you to the Expenses page.",
          });

          setTimeout(() => {
            onClose?.();
            router.push("/expenses");
          }, 1500);

          return;
        }
      }

      /* =========================================================
       * CREATION SUCCESS
       * ========================================================= */
      setState({
        ...result,
        success: true,
        message: "Expense created successfully.",
      });

      setTimeout(() => {
        onSuccess?.();
        onClose?.();

        if (result.expenseId) {
          router.push(`/expenses/${result.expenseId}`);
        }
      }, 1500);
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

        {!editingExpense ? (
          <ReceiptOcrUpload
            onOcrComplete={(result: OcrResult | null, file: File) => {
              setReceiptFile(file);
              setOcrResult(result);
            }}
          />
        ) : (
          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-800">📄 Supporting Receipt</p>

              <p className="text-sm text-gray-500">
                Review the existing receipt or upload a replacement.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {editingExpense.ocrReceiptPath && (
                <ReceiptViewerButton expenseId={editingExpense.id} />
              )}

              <label
                className={`inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-gray-50 ${
                  replacingReceipt ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {replacingReceipt
                  ? "Uploading..."
                  : editingExpense.ocrReceiptPath
                    ? "Replace Receipt"
                    : "Add Receipt"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  disabled={pending || replacingReceipt}
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    if (editingExpense) {
                      setReplacingReceipt(true);
                      setReceiptMessage("");

                      try {
                        const formData = new FormData();
                        formData.set("file", file);

                        const response = await fetch(
                          `/api/expenses/${editingExpense.id}/ocr-receipt`,
                          {
                            method: "PUT",
                            body: formData,
                          },
                        );

                        const result = await response.json();

                        if (!response.ok) {
                          throw new Error(
                            result.error ?? "Unable to compare the receipt.",
                          );
                        }

                        if (result.sameContent) {
                          setReceiptFile(null);
                          setPendingReceipt(null);
                          setReceiptChanged(false);

                          setReceiptMessage(
                            "This receipt is identical to the existing receipt. No change was made.",
                          );

                          return;
                        }

                        // The receipt is different, so upload it as a pending replacement.
                        const uploaded = await uploadReceiptFile(
                          editingExpense.id,
                          file,
                        );

                        setReceiptFile(file);
                        setPendingReceipt(uploaded);
                        setReceiptChanged(true);

                        setReceiptMessage(
                          editingExpense.ocrReceiptPath
                            ? "New receipt uploaded. Click Update Expense to save the replacement."
                            : "Receipt uploaded. Click Update Expense to save it.",
                        );
                      } catch (error) {
                        console.error(
                          "Receipt comparison/upload error:",
                          error,
                        );

                        setReceiptFile(null);
                        setPendingReceipt(null);
                        setReceiptChanged(false);

                        setReceiptMessage(
                          error instanceof Error
                            ? error.message
                            : "Unable to upload receipt.",
                        );
                      } finally {
                        setReplacingReceipt(false);
                        event.target.value = "";
                      }

                      return;
                    }
                  }}
                />
              </label>
            </div>

            {receiptMessage && (
              <p className="rounded bg-slate-50 p-3 text-sm text-slate-600">
                {receiptMessage}
              </p>
            )}
          </div>
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
          disabled={pending || (Boolean(editingExpense) && !hasChanges)}
          className={`w-full rounded px-4 py-2 text-white transition ${
            editingExpense && !hasChanges
              ? "cursor-not-allowed bg-slate-300 text-slate-500"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
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
