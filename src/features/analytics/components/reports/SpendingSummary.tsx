"use client";

import { Expense } from "@prisma/client";

type SpendingSummaryProps = {
  expenses: Expense[];
};

export default function SpendingSummary({ expenses }: SpendingSummaryProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center text-gray-500">
        No expense data available for the selected filters.
      </div>
    );
  }

  const amounts = expenses.map((expense) => Number(expense.amount));

  const totalExpenses = amounts.reduce((sum, amount) => sum + amount, 0);

  const averageExpense = totalExpenses / amounts.length;

  const highestExpense = Math.max(...amounts);

  const lowestExpense = Math.min(...amounts);

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Spending Summary</h3>

      <p className="mt-1 text-sm text-gray-500">
        A summary of your spending habits based on the selected filters.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Expenses</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Average Expense</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{averageExpense.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Highest Expense</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{highestExpense.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Lowest Expense</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{lowestExpense.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
