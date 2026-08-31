"use client";

import type { AnalyticsExpense } from "../../types";
import { getReportExpenseAmount } from "../../lib/getReportExpenseAmount";

type CurrencyTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    dataKey?: string;
    payload?: {
      expenses?: AnalyticsExpense[];
      total?: number;
      name?: string;
      category?: string;
      month?: string;
      year?: number;
      label?: string;
    };
  }>;
  selectedCurrency: string;
  defaultCurrency: string;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CurrencyTooltip({
  active,
  payload,
  selectedCurrency,
  defaultCurrency,
}: CurrencyTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const tooltipEntry = payload[0];
  const chartItem = tooltipEntry?.payload;

  if (!chartItem) {
    return null;
  }

  const allExpenses = chartItem.expenses ?? [];

  const activeSeriesName =
    tooltipEntry.name ?? tooltipEntry.dataKey ?? chartItem.category;

  const isCategorySeries =
    typeof activeSeriesName === "string" &&
    allExpenses.some((expense) => expense.category === activeSeriesName);

  const expenses = isCategorySeries
    ? allExpenses.filter((expense) => expense.category === activeSeriesName)
    : allExpenses;

  if (expenses.length === 0) {
    return null;
  }

  const isAllCurrencies = selectedCurrency === "ALL";

  const periodLabel =
    chartItem.month ??
    chartItem.label ??
    (chartItem.year !== undefined ? String(chartItem.year) : null);

  const heading = isCategorySeries
    ? `${periodLabel ?? "Expenses"} — ${activeSeriesName}`
    : (chartItem.name ??
      chartItem.category ??
      chartItem.month ??
      chartItem.label ??
      chartItem.year);

  /*
   * ------------------------------------------------------------------------
   * Specific currency
   * ------------------------------------------------------------------------
   */

  if (!isAllCurrencies) {
    const total = expenses.reduce(
      (sum, expense) =>
        sum +
        getReportExpenseAmount(expense, {
          selectedCurrency,
          defaultCurrency,
        }),
      0,
    );

    return (
      <div className="min-w-[190px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          {heading}
        </p>

        <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {selectedCurrency}
          </p>

          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {formatCurrency(total, selectedCurrency)}
          </p>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------------------
   * ALL CURRENCIES
   * ------------------------------------------------------------------------
   */

  const currencyBreakdown = new Map<
    string,
    {
      originalAmount: number;
      convertedAmount: number;
    }
  >();

  expenses.forEach((expense) => {
    const originalCurrency = expense.currency.trim().toUpperCase();

    const convertedAmount = getReportExpenseAmount(expense, {
      selectedCurrency,
      defaultCurrency,
    });

    const existing = currencyBreakdown.get(originalCurrency);

    if (existing) {
      existing.originalAmount += Number(expense.amount);
      existing.convertedAmount += convertedAmount;
    } else {
      currencyBreakdown.set(originalCurrency, {
        originalAmount: Number(expense.amount),
        convertedAmount,
      });
    }
  });

  const total = [...currencyBreakdown.values()].reduce(
    (sum, item) => sum + item.convertedAmount,
    0,
  );

  return (
    <div className="min-w-[230px] max-w-xs rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900">
      <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        {heading}
      </p>

      <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        {[...currencyBreakdown.entries()].map(([currency, breakdown]) => {
          const convertedText = formatCurrency(
            breakdown.convertedAmount,
            defaultCurrency,
          );

          const originalText = formatCurrency(
            breakdown.originalAmount,
            currency,
          );

          if (currency === defaultCurrency) {
            return (
              <div
                key={currency}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {currency}
                </span>

                <span className="font-semibold text-slate-900 dark:text-white">
                  {originalText}
                </span>
              </div>
            );
          }

          return (
            <div key={currency} className="text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {currency}
                </span>

                <span className="font-semibold text-slate-900 dark:text-white">
                  {originalText}
                </span>
              </div>

              <p className="mt-0.5 text-right text-xs text-slate-500 dark:text-slate-400">
                ≈ {convertedText}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total
          </span>

          <span className="text-base font-bold text-slate-900 dark:text-white">
            {formatCurrency(total, defaultCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
