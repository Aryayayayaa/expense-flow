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
import CurrencyTooltip from "./CurrencyTooltip";

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

  /*
   * Keep the original expenses for every month so the tooltip
   * can explain the original-currency values when ALL CURRENCIES
   * is selected.
   */
  const monthlyExpenses = new Map<
    string,
    {
      year: number;
      monthNumber: number;
      expenses: AnalyticsExpense[];
    }
  >();

  expenses.forEach((expense) => {
    const expenseDate = expense.expenseDate ?? expense.createdAt;

    const year = expenseDate.getFullYear();
    const monthNumber = expenseDate.getMonth() + 1;

    const key = `${year}-${String(monthNumber).padStart(2, "0")}`;

    const existing = monthlyExpenses.get(key);

    if (existing) {
      existing.expenses.push(expense);
    } else {
      monthlyExpenses.set(key, {
        year,
        monthNumber,
        expenses: [expense],
      });
    }
  });

  const chartData = Array.from(monthlyExpenses.entries())
    .map(([key, monthData]) => ({
      key,
      month: `${monthNames[monthData.monthNumber - 1]} ${monthData.year}`,
      year: monthData.year,
      monthNumber: monthData.monthNumber,
      expenses: monthData.expenses,
      total: monthData.expenses.reduce(
        (sum, expense) =>
          sum +
          getReportExpenseAmount(expense, {
            selectedCurrency,
            defaultCurrency,
          }),
        0,
      ),
    }))
    .sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      return a.monthNumber - b.monthNumber;
    });

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 dark:text-slate-400">
        No expense data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="mt-6 h-80 w-full min-w-0 text-slate-500 dark:text-slate-400">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid
            stroke="#94a3b8"
            strokeDasharray="3 3"
            opacity={0.25}
          />

          <XAxis
            dataKey="month"
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />

          <YAxis
            width={100}
            tickFormatter={(value) =>
              formatCurrency(Number(value), reportCurrency)
            }
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />

          <Tooltip
            content={
              <CurrencyTooltip
                selectedCurrency={selectedCurrency}
                defaultCurrency={defaultCurrency}
              />
            }
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
