import { Expense, Role } from "@prisma/client";

export type SerializedExpense = Omit<Expense, "amount"> & {
  amount: number;

  decidedBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;

  reimbursementBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;
};
