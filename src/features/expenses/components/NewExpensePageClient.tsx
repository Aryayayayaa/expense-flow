"use client";

import { useState } from "react";

import AddExpenseForm, { type EditableExpense } from "./AddExpenseForm";

import type { CurrencyCode } from "@/constants/currencies";

type NewExpensePageClientProps = {
  defaultCurrency: CurrencyCode;
};

export default function NewExpensePageClient({
  defaultCurrency,
}: NewExpensePageClientProps) {
  const [editingExpense, setEditingExpense] = useState<EditableExpense | null>(
    null,
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AddExpenseForm
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}
