"use client";

import { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";
import { ALL_CURRENCIES } from "@/constants/currencies";

type LargestExpensesProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
};

export default function LargestExpenses({
  expenses,
  selectedCurrency,
  defaultCurrency,
}: LargestExpensesProps) {
  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  const largestExpenses = [...expenses]
    .sort(
      (a, b) =>
        getReportExpenseAmount(b, {
          selectedCurrency,
          defaultCurrency,
        }) -
        getReportExpenseAmount(a, {
          selectedCurrency,
          defaultCurrency,
        }),
    )
    .slice(0, 5);

  if (largestExpenses.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Largest Expenses
        </h3>

        <p className="mt-4 text-center text-gray-500 dark:text-slate-400">
          No expense data available for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
        Largest Expenses
      </h3>

      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
        Your five largest individual expenses.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
              <th className="pb-3 pr-4 font-medium">Description</th>

              <th className="pb-3 pr-4 font-medium">Category</th>

              <th className="pb-3 pr-4 font-medium">Date</th>

              <th className="pb-3 text-right font-medium">Amount</th>
            </tr>
          </thead>

          <tbody>
            {largestExpenses.map((expense) => {
              const expenseDate = expense.expenseDate ?? expense.createdAt;

              const amount = getReportExpenseAmount(expense, {
                selectedCurrency,
                defaultCurrency,
              });

              return (
                <tr
                  key={expense.id}
                  className="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  <td className="py-4 pr-4 font-medium text-gray-900 dark:text-slate-100">
                    {expense.title}
                  </td>

                  <td className="py-4 pr-4 text-gray-600 dark:text-slate-400">
                    {expense.category}
                  </td>

                  <td className="py-4 pr-4 text-gray-600 dark:text-slate-400">
                    {expenseDate.toLocaleDateString("en-IN")}
                  </td>

                  <td className="py-4 text-right font-semibold text-gray-900 dark:text-slate-100">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: reportCurrency,
                    }).format(amount)}
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
