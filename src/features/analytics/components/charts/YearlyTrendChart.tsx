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

import { Expense } from "@prisma/client";

type YearlyTrendChartProps = {
  expenses: Expense[];
};

export default function YearlyTrendChart({ expenses }: YearlyTrendChartProps) {
  const yearlyData = expenses.reduce(
    (acc, expense) => {
      const date = expense.expenseDate ?? expense.createdAt;
      const year = date.getFullYear();

      const existingYear = acc.find((item) => item.year === year);

      if (existingYear) {
        existingYear.total += Number(expense.amount);
      } else {
        acc.push({
          year,
          total: Number(expense.amount),
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

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toFixed(2)}`,
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
