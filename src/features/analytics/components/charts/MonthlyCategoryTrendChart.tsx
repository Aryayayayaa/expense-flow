"use client";

import { useEffect, useState } from "react";

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

import { ALL_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { formatCurrency } from "@/utils/formatCurrency";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";
import CurrencyTooltip from "./CurrencyTooltip";

type MonthlyCategoryTrendChartProps = {
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
  selectedCurrency,
  defaultCurrency,
}: MonthlyCategoryTrendChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedCategory(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  const categories = [
    ...new Set(expenses.map((expense) => expense.category)),
  ].sort();

  const monthlyData = new Map<
    string,
    {
      year: number;
      monthNumber: number;
      label: string;
      expenses: AnalyticsExpense[];
      [category: string]: string | number | AnalyticsExpense[] | undefined;
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
        expenses: [],
      });
    }

    const monthData = monthlyData.get(key)!;

    monthData.expenses.push(expense);

    monthData[category] =
      Number(monthData[category] ?? 0) +
      getReportExpenseAmount(expense, {
        selectedCurrency,
        defaultCurrency,
      });
  });

  const chartData = Array.from(monthlyData.values())
    .map((monthData) => {
      /*
       * When a category is selected through the legend,
       * restrict the tooltip's underlying expenses to that
       * category only.
       */
      const tooltipExpenses = selectedCategory
        ? monthData.expenses.filter(
            (expense) => expense.category === selectedCategory,
          )
        : monthData.expenses;

      return {
        ...monthData,
        name: selectedCategory
          ? `${monthData.label} — ${selectedCategory}`
          : monthData.label,
        category: selectedCategory ?? undefined,
        expenses: tooltipExpenses,
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

  function handleLegendClick(entry: { value?: string }) {
    const category = entry.value;

    if (!category) {
      return;
    }

    setSelectedCategory((current) => (current === category ? null : category));
  }

  return (
    <div className="mt-6 h-80 w-full text-slate-500 dark:text-slate-400">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 70,
            bottom: 10,
          }}
        >
          <CartesianGrid
            stroke="#94a3b8"
            strokeDasharray="3 3"
            opacity={0.25}
          />

          <XAxis
            dataKey="label"
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
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              name={category}
              stroke={categoryColors[index % categoryColors.length]}
              strokeWidth={selectedCategory === category ? 4 : 2}
              strokeOpacity={
                selectedCategory && selectedCategory !== category ? 0.2 : 1
              }
              dot={{ r: selectedCategory === category ? 5 : 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
