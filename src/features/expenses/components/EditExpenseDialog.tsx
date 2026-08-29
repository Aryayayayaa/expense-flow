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
      </div>
    </div>
  );
}
