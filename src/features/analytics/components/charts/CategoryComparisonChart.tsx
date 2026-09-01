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

import { ALL_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";
import CurrencyTooltip from "./CurrencyTooltip";

type CategoryComparisonChartProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
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
  selectedCurrency,
  defaultCurrency,
}: CategoryComparisonChartProps) {
  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  /*
   * Keep the expenses belonging to each category.
   *
   * The total is still calculated using the existing
   * getReportExpenseAmount() rules:
   *
   * Specific currency:
   *   original transaction amount
   *
   * ALL CURRENCIES:
   *   converted amount in the user's default currency
   */
  const categoryExpenses = expenses.reduce<Record<string, AnalyticsExpense[]>>(
    (groups, expense) => {
      if (!groups[expense.category]) {
        groups[expense.category] = [];
      }

      groups[expense.category].push(expense);

      return groups;
    },
    {},
  );

  const chartData = Object.entries(categoryExpenses)
    .map(([category, categoryExpenseList]) => ({
      category,
      expenses: categoryExpenseList,
      total: categoryExpenseList.reduce(
        (sum, expense) =>
          sum +
          getReportExpenseAmount(expense, {
            selectedCurrency,
            defaultCurrency,
          }),
        0,
      ),
    }))
    .sort((a, b) => b.total - a.total);

  if (chartData.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-slate-400">
        No expense data available for the selected filters.
      </p>
    );
  }

  return (
    <div className="h-[360px] w-full text-slate-500 dark:text-slate-400 sm:h-[380px] lg:h-[400px]">
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
          <CartesianGrid
            stroke="#94a3b8"
            strokeDasharray="3 3"
            opacity={0.25}
          />

          <XAxis
            type="number"
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: reportCurrency,
                maximumFractionDigits: 0,
              }).format(Number(value))
            }
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 15 }}
          />

          <YAxis
            type="category"
            dataKey="category"
            width={90}
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
