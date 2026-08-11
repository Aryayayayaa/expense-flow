import { Expense } from "@prisma/client";

export type SerializedExpense = Omit<Expense, "amount"> & {
  amount: number;
};
