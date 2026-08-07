import AddExpenseForm from "@/features/expenses/components/AddExpenseForm";
import ExpenseList from "@/features/expenses/components/ExpenseList";
import ExpensesPageClient from "@/features/expenses/components/ExpensesPageClient";
import SummaryCard from "@/features/expenses/components/SummaryCard";
import { getExpenses } from "@/features/expenses/lib/expenses";

import { formatCurrency } from "@/utils/formatCurrency";
import { Wallet, Calendar, Folder } from "lucide-react";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

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
    <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">💸 Expenses</h1>

        <p className="mt-2 text-gray-500">
          Track and manage your daily expenses.
        </p>
      </div>

      <ExpensesPageClient expenses={expenses} />
    </main>
  );
}
