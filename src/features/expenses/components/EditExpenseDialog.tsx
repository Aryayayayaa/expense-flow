"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

import Button from "@/components/common/Button";

import {
  saveOcrReceiptAction,
  updateExpenseAction,
} from "../actions/expense-actions";

type EditExpense = {
  id: number;
  title: string;
  amount: number;
  currency: string;
  category: string;
  expenseDate: string | null;
  createdAt: string;
  ocrReceiptUrl: string | null;
  ocrReceiptPath: string | null;
};

type EditExpenseDialogProps = {
  open: boolean;
  expense: EditExpense | null;
  onClose: () => void;
  onSuccess?: () => void;
};

function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toDateTimeLocal(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return local.toISOString().slice(0, 16);
}

export default function EditExpenseDialog({
  open,
  expense,
  onClose,
  onSuccess,
}: EditExpenseDialogProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [category, setCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * Populate the dialog whenever it opens for an expense.
   */
  useEffect(() => {
    if (!open || !expense) {
      return;
    }

    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCurrency(expense.currency);
    setCategory(expense.category);

    setExpenseDate(toDateTimeLocal(expense.expenseDate, getCurrentDateTime()));

    setReceiptFile(null);
    setMessage("");
    setError("");
  }, [open, expense]);

  /*
   * Nothing to render if the dialog is closed or there is
   * no expense.
   */
  if (!open || !expense) {
    return null;
  }

  /*
   * From this point onward TypeScript knows that `expense`
   * is not null.
   */
  const currentExpense = expense;

  const hasReceipt = Boolean(
    currentExpense.ocrReceiptUrl || currentExpense.ocrReceiptPath,
  );

  function handleClose() {
    if (saving) {
      return;
    }

    onClose();
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      /*
       * ---------------------------------------------------------
       * STEP 1
       *
       * Update normal expense fields.
       *
       * IMPORTANT:
       * OCR is deliberately NOT involved here.
       *
       * Therefore uploading a receipt while editing will NOT
       * overwrite title, amount, category, date/time, etc.
       * ---------------------------------------------------------
       */
      const formData = new FormData();

      formData.set("title", title);
      formData.set("amount", amount);
      formData.set("currency", currency);
      formData.set("category", category);

      const dateValue = expenseDate ? new Date(expenseDate) : null;

      formData.set(
        "expenseDate",
        dateValue && !Number.isNaN(dateValue.getTime())
          ? dateValue.toISOString()
          : expenseDate,
      );

      const updateResult = await updateExpenseAction(
        currentExpense.id,
        formData,
      );

      if (!updateResult.success) {
        setError(updateResult.message || "Unable to update expense.");

        return;
      }

      /*
       * ---------------------------------------------------------
       * STEP 2
       *
       * Save receipt only when:
       *
       *   - user selected a receipt
       *   - expense does NOT already have a receipt
       *
       * This makes the receipt immutable.
       * ---------------------------------------------------------
       */
      if (receiptFile && !hasReceipt) {
        const extensionMap: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "application/pdf": "pdf",
        };

        const extension = extensionMap[receiptFile.type] ?? "bin";

        const safePath = `expenses/${currentExpense.id}/original-receipt-${Date.now()}.${extension}`;

        /*
         * Upload the original receipt.
         *
         * No OCR extraction is performed in this Edit flow.
         */
        const blob = await upload(safePath, receiptFile, {
          access: "private",
          handleUploadUrl: "/api/upload",
          clientPayload: JSON.stringify({
            expenseId: currentExpense.id,
            type: "ocr-receipt",
          }),
        });

        const receiptResult = await saveOcrReceiptAction(
          currentExpense.id,
          blob.url,
          blob.pathname,
          "",
        );

        if (!receiptResult.success) {
          setError(
            receiptResult.message ||
              "Expense was updated, but the receipt could not be saved.",
          );

          router.refresh();

          return;
        }
      }

      /*
       * ---------------------------------------------------------
       * STEP 3
       *
       * Everything succeeded.
       * ---------------------------------------------------------
       */
      setMessage("Expense updated successfully.");

      /*
       * Tell the parent that the expense changed.
       */
      onSuccess?.();

      /*
       * Refresh the Server Component so the latest receipt
       * state is fetched from Prisma.
       */
      router.refresh();

      /*
       * Close the dialog after the parent has been notified.
       */
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error("Edit Expense Error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to update expense.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-slate-900">Edit Expense</h2>

        <p className="mt-2 text-sm text-slate-500">
          Update the expense details.
        </p>

        <div className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              value={title}
              disabled={saving}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Amount
            </label>

            <input
              value={amount}
              disabled={saving}
              type="number"
              step="0.01"
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Currency
            </label>

            <input
              value={currency}
              disabled={saving}
              maxLength={3}
              onChange={(event) =>
                setCurrency(event.target.value.toUpperCase())
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>

            <input
              value={category}
              disabled={saving}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Expense Date & Time */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Expense Date & Time
            </label>

            <input
              value={expenseDate}
              disabled={saving}
              type="datetime-local"
              max={getCurrentDateTime()}
              onChange={(event) => setExpenseDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Receipt */}
          {!hasReceipt && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Receipt
              </label>

              <p className="mb-3 text-sm text-slate-500">
                No receipt is attached yet. You can upload the receipt now.
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={saving}
                onChange={(event) => {
                  setReceiptFile(event.target.files?.[0] ?? null);
                }}
                className="block w-full text-sm"
              />

              {receiptFile && (
                <p className="mt-2 text-sm text-blue-600">
                  Selected: {receiptFile.name}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Once attached, the receipt cannot be replaced.
              </p>
            </div>
          )}

          {/* Existing receipt */}
          {hasReceipt && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-800">
                Receipt already attached
              </p>

              <p className="mt-1 text-sm text-green-700">
                This receipt cannot be replaced or uploaded again.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" disabled={saving} onClick={handleClose}>
            Cancel
          </Button>

          <Button disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
