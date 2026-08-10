"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Expense } from "@prisma/client";

type CategoryComparisonChartProps = {
  expenses: Expense[];
};

const CATEGORY_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function CategoryComparisonChart({
  expenses,
}: CategoryComparisonChartProps) {
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] ?? 0) + Number(expense.amount);

      return totals;
    },
    {},
  );

  const chartData = Object.entries(categoryTotals)
    .map(([category, total]) => ({
      category,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  if (chartData.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No expense data available for the selected filters.
      </p>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 30,
            left: 30,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" tickFormatter={(value) => `₹${value}`} />

          <YAxis type="category" dataKey="category" width={100} />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toFixed(2)}`,
              "Total Expenses",
            ]}
          />

          <Bar dataKey="total" name="Total Expenses" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
