"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { ALL_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { formatCurrency } from "@/utils/formatCurrency";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";

type YearlyTrendChartProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
};

export default function YearlyTrendChart({
  expenses,
  selectedCurrency,
  defaultCurrency,
}: YearlyTrendChartProps) {
  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  const yearlyData = expenses.reduce(
    (acc, expense) => {
      const date = expense.expenseDate ?? expense.createdAt;
      const year = date.getFullYear();

      const amount = getReportExpenseAmount(expense, {
        selectedCurrency,
        defaultCurrency,
      });

      const existingYear = acc.find((item) => item.year === year);

      if (existingYear) {
        existingYear.total += amount;
      } else {
        acc.push({
          year,
          total: amount,
        });
      }

      return acc;
    },
    [] as { year: number; total: number }[],
  );

  yearlyData.sort((a, b) => a.year - b.year);

  if (yearlyData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No expense data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="mt-6 h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="year" />

          <YAxis
            tickFormatter={(value) =>
              formatCurrency(Number(value), reportCurrency)
            }
          />

          <Tooltip
            formatter={(value) => [
              formatCurrency(Number(value), reportCurrency),
              "Total Expenses",
            ]}
          />

          <Bar
            dataKey="total"
            name="Total Expenses"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
