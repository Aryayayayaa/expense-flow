export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;

  expenseDate: Date | null;

  createdAt: Date;
  updatedAt: Date;

  userId: number | null;
}