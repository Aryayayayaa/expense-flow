"use client";

import { useState } from "react";
import ExpenseList from "@/components/expenses/ExpenseList";

import type { Expense } from "@/types/expense";

export default function ExpensesPage() {
  const [expenses] = useState<Expense[]>([]);

  return (
    <main>
      <h1>Expenses</h1>

      <ExpenseList expenses={expenses} />
    </main>
  );
}
