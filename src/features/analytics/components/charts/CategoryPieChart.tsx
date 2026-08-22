"use client";

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
  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  /*
   * Keep the original expenses inside each chart data item.
   *
   * The displayed total is calculated using the same currency
   * rules as the rest of Analysis:
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

  const data = Object.entries(categoryExpenses).map(
    ([category, categoryExpenseList]) => ({
      name: category,
      expenses: categoryExpenseList,
      value: categoryExpenseList.reduce(
        (total, expense) =>
          total +
          getReportExpenseAmount(expense, {
            selectedCurrency,
            defaultCurrency,
          }),
        0,
      ),
    }),
  );

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
            content={
              <CurrencyTooltip
                selectedCurrency={selectedCurrency}
                defaultCurrency={defaultCurrency}
              />
            }
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
              currency: reportCurrency,
            }).format(totalExpenses)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
