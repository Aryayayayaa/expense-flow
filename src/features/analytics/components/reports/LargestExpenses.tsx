"use client";

import { Expense } from "@prisma/client";

type LargestExpensesProps = {
  expenses: Expense[];
};

export default function LargestExpenses({ expenses }: LargestExpensesProps) {
  const largestExpenses = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  if (largestExpenses.length === 0) {
    return (
      <p className="text-gray-500">
        No expense data available for the selected filters.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Largest Expenses</h3>

      <p className="mt-1 text-sm text-gray-500">
        Your five largest individual expenses.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-500">
              <th className="pb-3 pr-4 font-medium">Description</th>
              <th className="pb-3 pr-4 font-medium">Category</th>
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 text-right font-medium">Amount</th>
            </tr>
          </thead>

          <tbody>
            {largestExpenses.map((expense) => {
              const expenseDate = expense.expenseDate ?? expense.createdAt;

              return (
                <tr key={expense.id} className="border-b last:border-b-0">
                  <td className="py-4 pr-4 font-medium text-gray-900">
                    {expense.title}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {expense.category}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {expenseDate.toLocaleDateString("en-IN")}
                  </td>

                  <td className="py-4 text-right font-semibold text-gray-900">
                    ₹{Number(expense.amount).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
