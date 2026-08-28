"use client";

import { useEffect } from "react";

import AddExpenseForm from "./AddExpenseForm";
//import type { DisplayExpense } from "../types";
import type { CurrencyCode } from "@/constants/currencies";

type EditExpense = {
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

type EditExpenseDialogProps = {
  open: boolean;
  expense: EditExpense | null;
  defaultCurrency?: CurrencyCode;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function EditExpenseDialog({
  open,
  expense,
  defaultCurrency,
  onClose,
  onSuccess,
}: EditExpenseDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
<<<<<<< HEAD
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={expense ? "Edit Expense" : "Add Expense"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <AddExpenseForm
          editingExpense={expense}
          setEditingExpense={(value) => {
            if (value === null) {
              onClose();
            }
          }}
          defaultCurrency={defaultCurrency}
          onClose={onClose}
          onSuccess={onSuccess}
        />
=======
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl text-black disabled:text-black"
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
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  A receipt is already attached. Select a new receipt below to
                  replace the existing one.
                </p>

                <button
                  type="button"
                  disabled={saving || viewingReceipt}
                  onClick={handleViewExistingReceipt}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eye size={16} />
                  {viewingReceipt ? "Opening..." : "View Receipt"}
                </button>
              </div>
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

            {receiptFile && selectedReceiptUrl && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-white p-3">
                <p className="text-sm text-blue-600">
                  Selected: {receiptFile.name}
                </p>

                {receiptFile.type.startsWith("image/") && (
                  <button
                    type="button"
                    onClick={handleViewSelectedReceipt}
                    className="mt-3 block w-full overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={selectedReceiptUrl}
                      alt="Selected receipt preview"
                      className="max-h-56 w-full object-contain bg-slate-50"
                    />
                  </button>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleViewSelectedReceipt}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eye size={16} />
                  View Selected Receipt
                </button>
              </div>
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
>>>>>>> 22d36d1 (feat:improved ui for dark mode)
      </div>
    </div>
  );
}
