import type { AnalyticsExpense } from "../types";

export function getReportExpenseAmount(
  expense: AnalyticsExpense,
  currency: string,
): number {
  if (currency === "INR") {
    return Number(expense.baseCurrencyAmount ?? expense.amount);
  }

  return Number(expense.amount);
}
