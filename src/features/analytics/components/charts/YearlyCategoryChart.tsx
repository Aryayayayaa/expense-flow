"use client";

import { useState } from "react";

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

import { ALL_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { formatCurrency } from "@/utils/formatCurrency";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";
import CurrencyTooltip from "./CurrencyTooltip";

type YearlyCategoryChartProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
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
  selectedCurrency,
  defaultCurrency,
}: YearlyCategoryChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  const categories = [
    ...new Set(expenses.map((expense) => expense.category)),
  ].sort();

  const yearlyData = new Map<
    number,
    {
      year: number;
      expenses: AnalyticsExpense[];
      [category: string]: string | number | AnalyticsExpense[] | undefined;
    }
  >();

  expenses.forEach((expense) => {
    const expenseDate = expense.expenseDate ?? expense.createdAt;

    const year = expenseDate.getFullYear();
    const category = expense.category;

    if (!yearlyData.has(year)) {
      yearlyData.set(year, {
        year,
        expenses: [],
      });
    }

    const yearData = yearlyData.get(year)!;

    yearData.expenses.push(expense);

    yearData[category] =
      Number(yearData[category] ?? 0) +
      getReportExpenseAmount(expense, {
        selectedCurrency,
        defaultCurrency,
      });
  });

  const chartData = Array.from(yearlyData.values())
    .map((yearData) => {
      /*
       * When a category is selected through the legend,
       * restrict the tooltip's underlying expenses to that
       * category only.
       */
      const tooltipExpenses = selectedCategory
        ? yearData.expenses.filter(
            (expense) => expense.category === selectedCategory,
          )
        : yearData.expenses;

      return {
        ...yearData,
        name: selectedCategory
          ? `${yearData.year} — ${selectedCategory}`
          : String(yearData.year),
        category: selectedCategory ?? undefined,
        expenses: tooltipExpenses,
      };
    })
    .sort((a, b) => a.year - b.year);

  if (chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No expense data available for the selected filters.
      </div>
    );
  }

  function handleLegendClick(entry: { value?: string }) {
    const category = entry.value;

    if (!category) {
      return;
    }

    setSelectedCategory((current) => (current === category ? null : category));
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
            tickFormatter={(value) =>
              formatCurrency(Number(value), reportCurrency)
            }
          />

          <Tooltip
            shared={false}
            content={
              <CurrencyTooltip
                selectedCurrency={selectedCurrency}
                defaultCurrency={defaultCurrency}
              />
            }
          />

          <Legend
            onClick={handleLegendClick}
            wrapperStyle={{
              cursor: "pointer",
            }}
          />

          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              name={category}
              stackId="expenses"
              fill={categoryColors[index % categoryColors.length]}
              fillOpacity={
                selectedCategory && selectedCategory !== category ? 0.2 : 1
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
