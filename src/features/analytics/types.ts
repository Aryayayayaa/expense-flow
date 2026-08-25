export type AnalyticsExpense = {
  id: number;
  title: string;

  // Original transaction amount and currency.
  amount: number;
  currency: string;

  // Status filtering variables.
  status: "PENDING" | "APPROVED" | "REJECTED";
  reimbursementStatus: "PENDING" | "REIMBURSED" | "REJECTED";

  // Normalized application base-currency value.
  baseCurrencyAmount: number | null;
  exchangeRate: number | null;
  exchangeRateAt: Date | null;

  // Current reporting conversion.
  convertedDisplayAmount: number | null;
  displayExchangeRate: number | null;
  displayExchangeRateAt: Date | null;

  category: string;
  expenseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number | null;
};
