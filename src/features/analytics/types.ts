export type AnalyticsExpense = {
  id: number;
  title: string;

  // Original transaction amount and currency.
  amount: number;
  currency: string;

  //status filtering variables
  status: "PENDING" | "APPROVED" | "REJECTED";
  reimbursementStatus: "PENDING" | "REIMBURSED" | "REJECTED";

  // Normalized application base-currency value.
  baseCurrencyAmount: number | null;
  exchangeRate: number | null;
  exchangeRateAt: Date | null;

  category: string;
  expenseDate: Date | null;
  billProofUrl: string | null;
  billProofPath: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number | null;
};
