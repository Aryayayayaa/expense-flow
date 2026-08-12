export type AnalyticsExpense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  expenseDate: Date | null;
  billProofUrl: string | null;
  billProofPath: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number | null;
};
