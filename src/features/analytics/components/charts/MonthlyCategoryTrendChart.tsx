"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnalyticsExpense } from "../../types";

type MonthlyCategoryTrendChartProps = {
  expenses: AnalyticsExpense[];
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

export default function MonthlyCategoryTrendChart({
  expenses,
}: MonthlyCategoryTrendChartProps) {
  const categories = [
    ...new Set(expenses.map((expense) => expense.category)),
  ].sort();

  const monthlyData = new Map<
    string,
    {
      year: number;
      monthNumber: number;
      label: string;
      [category: string]: string | number;
    }
  >();

  expenses.forEach((expense) => {
    const expenseDate = expense.expenseDate ?? expense.createdAt;

    const year = expenseDate.getFullYear();
    const monthNumber = expenseDate.getMonth() + 1;
    const category = expense.category;

    const key = `${year}-${String(monthNumber).padStart(2, "0")}`;

    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        year,
        monthNumber,
        label: `${monthNames[monthNumber - 1]} ${year}`,
      });
    }

    const monthData = monthlyData.get(key)!;

    monthData[category] =
      Number(monthData[category] ?? 0) + Number(expense.amount);
  });

  const chartData = Array.from(monthlyData.values()).sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    return a.monthNumber - b.monthNumber;
  });

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No expense data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="mt-6 h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="label" />

          <YAxis />

          <Tooltip
            formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Expenses"]}
          />

          <Legend />

          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              name={category}
              stroke={categoryColors[index % categoryColors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
