"use client";

import { AnalyticsExpense } from "../../types";

type TopCategoriesProps = {
  expenses: AnalyticsExpense[];
};

export default function TopCategories({ expenses }: TopCategoriesProps) {
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] ?? 0) + Number(expense.amount);

      return totals;
    },
    {},
  );

  const categories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (categories.length === 0) {
    return (
      <p className="text-gray-500">
        No expense data available for the selected filters.
      </p>
    );
  }

  const maxAmount = categories[0].amount;

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Top Spending Categories
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Categories ranked by total spending.
      </p>

      <div className="mt-6 space-y-5">
        {categories.map((item) => {
          const percentage =
            maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

          return (
            <div key={item.category}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {item.category}
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  ₹{item.amount.toFixed(2)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
