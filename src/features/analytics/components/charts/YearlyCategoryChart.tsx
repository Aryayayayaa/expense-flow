"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnalyticsExpense } from "../../types";
import { formatCurrency } from "@/utils/formatCurrency";

type YearlyCategoryChartProps = {
  expenses: AnalyticsExpense[];
  currency: string;
};

const categoryColors = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

export default function YearlyCategoryChart({
  expenses,
  currency,
}: YearlyCategoryChartProps) {
  const categories = [
    ...new Set(expenses.map((expense) => expense.category)),
  ].sort();

  const yearlyData = new Map<
    number,
    {
      year: number;
      [category: string]: string | number;
    }
  >();

  expenses.forEach((expense) => {
    const expenseDate = expense.expenseDate ?? expense.createdAt;

    const year = expenseDate.getFullYear();
    const category = expense.category;

    if (!yearlyData.has(year)) {
      yearlyData.set(year, {
        year,
      });
    }

    const yearData = yearlyData.get(year)!;

    yearData[category] =
      Number(yearData[category] ?? 0) + Number(expense.amount);
  });

  const chartData = Array.from(yearlyData.values()).sort(
    (a, b) => a.year - b.year,
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No expense data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="mt-6 h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="year" />

          <YAxis
            tickFormatter={(value) => formatCurrency(Number(value), currency)}
          />

          <Tooltip
            formatter={(value) => [
              formatCurrency(Number(value), currency),
              "Expenses",
            ]}
          />

          <Legend />

          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              name={category}
              stackId="expenses"
              fill={categoryColors[index % categoryColors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
