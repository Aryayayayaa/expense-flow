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

  /*
   * Recharts provides the currently hovered series through
   * payload[0].name / payload[0].dataKey.
   *
   * For category charts this will be something like:
   *
   *   "Maintenance & Repairs"
   *   "Bills"
   *   "Travel & Meals"
   *
   * Therefore, when the tooltip belongs to a category series,
   * only expenses belonging to that category should be used.
   */
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

  /*
   * ------------------------------------------------------------------------
   * Tooltip heading
   * ------------------------------------------------------------------------
   */

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
   *
   * The expenses have already been filtered to the selected
   * original currency.
   *
   * Therefore the original transaction amount is used directly.
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
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-2 text-sm font-semibold text-slate-100">{heading}</p>

        <p className="text-sm text-slate-700 dark:text-slate-300">
          {selectedCurrency}: {formatCurrency(total, selectedCurrency)}
        </p>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------------------
   * ALL CURRENCIES
   * ------------------------------------------------------------------------
   *
   * Group ONLY the expenses belonging to the currently hovered
   * chart series.
   *
   * Example when hovering Maintenance & Repairs:
   *
   * EUR: €56.00 = ₹6,261.92
   * USD: $100.00 = ₹9,567.00
   *
   * Total: ₹15,828.92
   *
   * Expenses belonging to Bills, Utilities, etc. are NOT included.
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
    <div className="max-w-xs rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-3 text-sm font-semibold text-slate-100">{heading}</p>

      <div className="space-y-1.5">
        {[...currencyBreakdown.entries()].map(([currency, breakdown]) => {
          const convertedText = formatCurrency(
            breakdown.convertedAmount,
            defaultCurrency,
          );

          const originalText = formatCurrency(
            breakdown.originalAmount,
            currency,
          );

          /*
           * When the original currency is already the user's
           * default currency, no conversion explanation is necessary.
           */
          if (currency === defaultCurrency) {
            return (
              <p key={currency} className="text-sm text-slate-700">
                {currency}: {originalText}
              </p>
            );
          }

          return (
            <p key={currency} className="text-sm text-slate-700">
              {currency}: {originalText} = {convertedText}
            </p>
          );
        })}
      </div>

      <div className="mt-3 border-t border-slate-200 pt-2 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-100">
          Total: {formatCurrency(total, defaultCurrency)}
        </p>
      </div>
    </div>
  );
}
