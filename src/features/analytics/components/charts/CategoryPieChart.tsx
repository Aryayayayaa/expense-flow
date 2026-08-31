"use client";

import { useState, useEffect } from "react";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ALL_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";
import CurrencyTooltip from "./CurrencyTooltip";

type CategoryPieChartProps = {
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

export default function CategoryPieChart({
  expenses,
  selectedCurrency,
  defaultCurrency,
}: CategoryPieChartProps) {
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

  /*
   * Group expenses by category.
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

  const data = Object.entries(categoryExpenses).map(
    ([category, categoryExpenseList]) => {
      /*
       * When a legend category is selected, the tooltip should
       * use only that category's expenses.
       *
       * Otherwise it uses the expenses belonging to the
       * currently hovered pie slice.
       */
      const tooltipExpenses = selectedCategory
        ? (categoryExpenses[selectedCategory] ?? [])
        : categoryExpenseList;

      return {
        name: category,
        expenses: tooltipExpenses,
        value: categoryExpenseList.reduce(
          (total, expense) =>
            total +
            getReportExpenseAmount(expense, {
              selectedCurrency,
              defaultCurrency,
            }),
          0,
        ),
      };
    },
  );

  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-slate-400">
        No expense data available for the selected filters.
      </p>
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
    <div className="h-[400px] w-full text-slate-500 dark:text-slate-400">
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
                opacity={
                  selectedCategory && selectedCategory !== entry.name ? 0.35 : 1
                }
              />
            ))}
          </Pie>

          <Tooltip
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

          <text
            x="50%"
            y="42%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500 text-sm dark:fill-slate-400"
          >
            Total Expenses
          </text>

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-900 text-lg font-semibold dark:fill-slate-100"
          >
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: reportCurrency,
            }).format(totalExpenses)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
