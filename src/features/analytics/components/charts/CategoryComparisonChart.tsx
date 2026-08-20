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

import { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";

type CategoryComparisonChartProps = {
  expenses: AnalyticsExpense[];
  currency: string;
};

const CATEGORY_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export default function CategoryComparisonChart({
  expenses,
  currency,
}: CategoryComparisonChartProps) {
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      const amount = getReportExpenseAmount(expense, currency);

      totals[expense.category] = (totals[expense.category] ?? 0) + amount;

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

          <XAxis
            type="number"
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
              }).format(Number(value))
            }
          />

          <YAxis type="category" dataKey="category" width={100} />

          <Tooltip
            formatter={(value) => [
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency,
              }).format(Number(value)),
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
