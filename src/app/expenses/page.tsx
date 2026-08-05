"use client";

import { useState } from "react";
import ExpenseList from "@/features/expenses/components/ExpenseList";

import type { Expense } from "@/features/expenses/types/expense";

export default function ExpensesPage() {
  const [expenses] = useState<Expense[]>([]);

  return (
    <main>
      <h1>Expenses</h1>

      <ExpenseList expenses={expenses} />
    </main>
  );
}
