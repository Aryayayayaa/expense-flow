"use client";

import { useState } from "react";

import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import SummaryCard from "./SummaryCard";

import { Expense } from "@/features/expenses/types/expense";

import { formatCurrency } from "@/utils/formatCurrency";

import { Wallet, Calendar, Folder } from "lucide-react";

type ExpensesPageClientProps = {
  expenses: Expense[];
};

export default function ExpensesPageClient({
  expenses,
}: ExpensesPageClientProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const currentDate = new Date();

  const thisMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = expense.expenseDate ?? expense.createdAt;

      return (
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const totalCategories = new Set(expenses.map((expense) => expense.category))
    .size;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<Wallet size={22} />}
        />

        <SummaryCard
          title="This Month"
          value={formatCurrency(thisMonthExpenses)}
          icon={<Calendar size={22} />}
        />

        <SummaryCard
          title="Categories"
          value={totalCategories}
          icon={<Folder size={22} />}
        />
      </div>

      <hr className="my-6" />

      <AddExpenseForm
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
      />

      <div className="mt-10">
        <ExpenseList expenses={expenses} onEdit={setEditingExpense} />
      </div>
    </>
  );
}
