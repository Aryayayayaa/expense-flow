"use client";

import { SUPPORTED_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";

type LargestExpensesProps = {
  expenses: AnalyticsExpense[];
  currency: string;
};

function getCurrencySymbol(currencyCode: string) {
  const currency = SUPPORTED_CURRENCIES.find(
    (currency) => currency.code === currencyCode,
  );

  return currency?.symbol ?? currencyCode;
}

function formatInrAmount(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatOriginalAmount(amount: number | string, currencyCode: string) {
  const numericAmount = Number(amount);
  const symbol = getCurrencySymbol(currencyCode);

  return `${symbol}${numericAmount.toFixed(2)}`;
}

export default function LargestExpenses({
  expenses,
  currency,
}: LargestExpensesProps) {
  const largestExpenses = [...expenses]
    .sort(
      (a, b) =>
        getReportExpenseAmount(b, currency) -
        getReportExpenseAmount(a, currency),
    )
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

              <th className="pb-3 pr-4 text-right font-medium">INR Amount</th>

              <th className="pb-3 text-right font-medium">Original Amount</th>
            </tr>
          </thead>

          <tbody>
            {largestExpenses.map((expense) => {
              const expenseDate = expense.expenseDate ?? expense.createdAt;

              const inrAmount = Number(
                expense.baseCurrencyAmount ?? expense.amount,
              );

              const isInr = expense.currency === "INR";

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

                  <td className="py-4 pr-4 text-right font-semibold text-gray-900">
                    {formatInrAmount(inrAmount)}
                  </td>

                  <td className="py-4 text-right font-semibold text-gray-900">
                    {isInr
                      ? "—"
                      : formatOriginalAmount(expense.amount, expense.currency)}
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
