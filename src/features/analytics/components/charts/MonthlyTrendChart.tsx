"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ALL_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { formatCurrency } from "@/utils/formatCurrency";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";

type MonthlyTrendChartProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
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

export default function MonthlyTrendChart({
  expenses,
  selectedCurrency,
  defaultCurrency,
}: MonthlyTrendChartProps) {
  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  const monthlyTotals = new Map<string, number>();

  expenses.forEach((expense) => {
    const expenseDate = expense.expenseDate ?? expense.createdAt;

    const year = expenseDate.getFullYear();
    const month = expenseDate.getMonth();

    const key = `${year}-${String(month + 1).padStart(2, "0")}`;

    const currentTotal = monthlyTotals.get(key) ?? 0;

    monthlyTotals.set(
      key,
      currentTotal +
        getReportExpenseAmount(expense, {
          selectedCurrency,
          defaultCurrency,
        }),
    );
  });

  const chartData = Array.from(monthlyTotals.entries())
    .map(([key, total]) => {
      const [year, month] = key.split("-").map(Number);

      return {
        key,
        month: `${monthNames[month - 1]} ${year}`,
        total,
        year,
        monthNumber: month,
      };
    })
    .sort((a, b) => {
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

          <XAxis dataKey="month" />

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

          <Line
            type="monotone"
            dataKey="total"
            name="Total Expenses"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
