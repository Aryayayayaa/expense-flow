"use client";

import { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";
import { formatCurrency } from "@/utils/formatCurrency";
import { ALL_CURRENCIES } from "@/constants/currencies";

type TopCategoriesProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
};

export default function TopCategories({
  expenses,
  selectedCurrency,
  defaultCurrency,
}: TopCategoriesProps) {
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      const amount = getReportExpenseAmount(expense, {
        selectedCurrency,
        defaultCurrency,
      });

      totals[expense.category] = (totals[expense.category] ?? 0) + amount;

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
      <p className="text-gray-500 dark:text-slate-400">
        No expense data available for the selected filters.
      </p>
    );
  }

  const maxAmount = categories[0].amount;

  /*
   * Display currency:
   *
   * Specific currency:
   *   Use the selected currency.
   *
   * ALL CURRENCIES:
   *   All values have been converted into the authenticated
   *   user's current default currency, so display using
   *   the default currency instead of "ALL".
   */
  const displayCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
        Top Spending Categories
      </h3>

      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
        Categories ranked by total spending.
      </p>

      <div className="mt-6 space-y-5">
        {categories.map((item) => {
          const percentage =
            maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

          return (
            <div key={item.category}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {item.category}
                </span>

                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  {formatCurrency(item.amount, displayCurrency)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
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
