import { Expense, Role } from "@prisma/client";

export type AdminModification = {
  admin: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };

  modifiedAt: Date;

  changes: Record<
    string,
    {
      from: string | number | null;
      to: string | number | null;
    }
  >;
};

export type SerializedExpense = Omit<
  Expense,
  "amount" | "baseCurrencyAmount" | "exchangeRate"
> & {
  amount: number;
  baseCurrencyAmount: number | null;
  exchangeRate: number | null;

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

  /*
   * Optional because not every expense query loads
   * Admin modification information.
   */
  adminModification?: AdminModification | null;
};

/*
 * Expense prepared specifically for display.
 *
 * displayAmount is calculated using the user's CURRENT
 * default currency. It does not modify the original
 * stored expense amount/currency.
 */
export type DisplayExpense = SerializedExpense & {
  displayAmount: number;
};
