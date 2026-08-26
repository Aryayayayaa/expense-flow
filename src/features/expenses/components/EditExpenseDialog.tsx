"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

import Button from "@/components/common/Button";

import { saveOcrReceiptAction } from "../actions/expense-actions";
import { SUPPORTED_CURRENCIES } from "@/constants/currencies";

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

  if (!open || !expense) {
    return null;
  }

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

      /*
       * ---------------------------------------------------------
       * UPDATE EXISTING EXPENSE
       * ---------------------------------------------------------
       *
       * Use the REST API directly so the browser sends:
       *
       * PATCH /api/expenses/[id]
       *
       * instead of invoking the Server Action directly.
       */
      const updateResponse = await fetch(`/api/expenses/${currentExpense.id}`, {
        method: "PATCH",
        body: formData,
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok || !updateResult.success) {
        setError(updateResult.message || "Unable to update expense.");
        return;
      }

      /*
       * ---------------------------------------------------------
       * REPLACE / SAVE RECEIPT IF ONE WAS SELECTED
       * ---------------------------------------------------------
       */
      if (receiptFile) {
        const extensionMap: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "application/pdf": "pdf",
        };

        const extension = extensionMap[receiptFile.type];

        if (!extension) {
          setError(
            "Unsupported receipt format. Please upload JPG, PNG, WEBP, or PDF.",
          );
          return;
        }

        const safePath = `expenses/${currentExpense.id}/original-receipt-${Date.now()}.${extension}`;

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

      setMessage(
        receiptFile
          ? "Expense and receipt updated successfully."
          : "Expense updated successfully.",
      );

      onSuccess?.();

      router.refresh();

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
          Update the expense details and replace the receipt if needed.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              value={title}
              disabled={saving}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Currency
            </label>
            
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>

            <input
              value={category}
              disabled={saving}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Receipt
            </label>

            {hasReceipt ? (
              <p className="mb-3 text-sm text-slate-500">
                A receipt is already attached. Select a new receipt below to
                replace the existing one.
              </p>
            ) : (
              <p className="mb-3 text-sm text-slate-500">
                No receipt is attached yet. You can upload one now.
              </p>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={saving}
              onChange={(event) => {
                setReceiptFile(event.target.files?.[0] ?? null);
              }}
              className="block w-full text-sm disabled:cursor-not-allowed"
            />

            {receiptFile && (
              <p className="mt-2 text-sm text-blue-600">
                Selected: {receiptFile.name}
              </p>
            )}

            <p className="mt-2 text-xs text-slate-500">
              {hasReceipt
                ? "Uploading a new receipt will replace the existing receipt."
                : "You can upload a receipt now or leave it unchanged."}
            </p>
          </div>

          {saving && (
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
                Updating expense. Please wait while the changes are saved...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" disabled={saving} onClick={handleClose}>
            Cancel
          </Button>

          <Button disabled={saving} onClick={handleSave}>
            {saving ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
