"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";

type CategoryPieChartProps = {
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

export default function CategoryPieChart({
  expenses,
  currency,
}: CategoryPieChartProps) {
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      const amount = getReportExpenseAmount(expense, currency);

      totals[expense.category] = (totals[expense.category] ?? 0) + amount;

      return totals;
    },
    {},
  );

  const data = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No expense data available for the selected filters.
      </p>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={90}
            outerRadius={140}
            paddingAngle={2}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => [
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency,
              }).format(Number(value)),
              "Expenses",
            ]}
          />

          <Legend />

          <text
            x="50%"
            y="42%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-500 text-sm"
          >
            Total Expenses
          </text>

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-900 text-lg font-semibold"
          >
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency,
            }).format(totalExpenses)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
