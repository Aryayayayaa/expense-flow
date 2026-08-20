"use client";

import { AnalyticsExpense } from "../../types";
import { formatCurrency } from "@/utils/formatCurrency";

type ReportSummaryProps = {
  expenses: AnalyticsExpense[];
  currency: string;
};

export default function ReportSummary({
  expenses,
  currency,
}: ReportSummaryProps) {
  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum +
      Number(
        currency === "INR"
          ? (expense.baseCurrencyAmount ?? expense.amount)
          : expense.amount,
      ),
    0,
  );

  const transactionCount = expenses.length;

  const averageExpense =
    transactionCount > 0 ? totalExpenses / transactionCount : 0;

  const highestExpense =
    transactionCount > 0
      ? Math.max(
          ...expenses.map((expense) =>
            Number(
              currency === "INR"
                ? (expense.baseCurrencyAmount ?? expense.amount)
                : expense.amount,
            ),
          ),
        )
      : 0;

  const summary = [
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses, currency),
    },
    {
      label: "Transactions",
      value: transactionCount.toString(),
    },
    {
      label: "Average Expense",
      value: formatCurrency(averageExpense, currency),
    },
    {
      label: "Highest Expense",
      value: formatCurrency(highestExpense, currency),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summary.map((item) => (
        <div key={item.label} className="rounded-lg border bg-gray-50 p-5">
          <p className="text-sm font-medium text-gray-500">{item.label}</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
