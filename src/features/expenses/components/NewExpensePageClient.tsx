"use client";

import { useState } from "react";

import AddExpenseForm from "./AddExpenseForm";

import type { DisplayExpense } from "../types";
import type { CurrencyCode } from "@/constants/currencies";

type NewExpensePageClientProps = {
  defaultCurrency: CurrencyCode;
};

export default function NewExpensePageClient({
  defaultCurrency,
}: NewExpensePageClientProps) {
  const [editingExpense, setEditingExpense] = useState<DisplayExpense | null>(
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
