"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ALL_CURRENCIES } from "@/constants/currencies";

import { AnalyticsExpense } from "../../types";
import { formatCurrency } from "@/utils/formatCurrency";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";
import CurrencyTooltip from "./CurrencyTooltip";

type YearlyTrendChartProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
};

export default function YearlyTrendChart({
  expenses,
  selectedCurrency,
  defaultCurrency,
}: YearlyTrendChartProps) {
  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  /*
   * Keep the original expenses belonging to each year.
   *
   * The yearly total continues to use getReportExpenseAmount()
   * so the calculation rules remain unchanged.
   *
   * Keeping the underlying expenses also allows CurrencyTooltip
   * to explain the original-currency values when ALL CURRENCIES
   * is selected.
   */
  const yearlyExpenses = new Map<number, AnalyticsExpense[]>();

  expenses.forEach((expense) => {
    const date = expense.expenseDate ?? expense.createdAt;
    const year = date.getFullYear();

    const existingExpenses = yearlyExpenses.get(year);

    if (existingExpenses) {
      existingExpenses.push(expense);
    } else {
      yearlyExpenses.set(year, [expense]);
    }
  });

  const yearlyData = Array.from(yearlyExpenses.entries())
    .map(([year, yearExpenses]) => ({
      year,
      expenses: yearExpenses,
      total: yearExpenses.reduce(
        (sum, expense) =>
          sum +
          getReportExpenseAmount(expense, {
            selectedCurrency,
            defaultCurrency,
          }),
        0,
      ),
    }))
    .sort((a, b) => a.year - b.year);

  if (yearlyData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No expense data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="mt-6 h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="year" />

          <YAxis
            tickFormatter={(value) =>
              formatCurrency(Number(value), reportCurrency)
            }
          />

          <Tooltip
            content={
              <CurrencyTooltip
                selectedCurrency={selectedCurrency}
                defaultCurrency={defaultCurrency}
              />
            }
          />

          <Bar
            dataKey="total"
            name="Total Expenses"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
