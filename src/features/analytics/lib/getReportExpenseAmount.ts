import type { AnalyticsExpense } from "../types";

type ReportExpenseAmountOptions = {
  selectedCurrency: string;
  defaultCurrency: string;
};

export function getReportExpenseAmount(
  expense: AnalyticsExpense,
  { selectedCurrency, defaultCurrency }: ReportExpenseAmountOptions,
): number {
  const selected = selectedCurrency.trim().toUpperCase();
  const defaultCurrencyCode = defaultCurrency.trim().toUpperCase();

  /*
   * Specific currency:
   * The expense list must already have been filtered so that
   * expense.currency === selectedCurrency.
   * Therefore we use the ORIGINAL stored amount.
   */
  if (selected !== "ALL") {
    return Number(expense.amount);
  }

  /*
   * ALL CURRENCIES:
   * If the expense already uses the user's default currency,
   * no conversion is required.
   */
  if (expense.currency === defaultCurrencyCode) {
    return Number(expense.amount);
  }

  /*
   * Otherwise use the current conversion calculated on the
   * server specifically for the authenticated user's
   * current default currency.
   */
  if (expense.convertedDisplayAmount !== null) {
    return Number(expense.convertedDisplayAmount);
  }

  /*
   * This should only be reached if conversion data was
   * unavailable. Do not silently use another currency's
   * amount as though it were the default currency.
   */
  return 0;
}
