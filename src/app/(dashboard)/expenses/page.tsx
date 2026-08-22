import ExpensesPageClient from "@/features/expenses/components/ExpensesPageClient";
import type { CurrencyCode } from "@/constants/currencies";

import {
  getDeletedExpensesForUser,
  getExpenses,
} from "@/features/expenses/lib/expenses";

import { auth } from "@/auth";

type ExpensesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);

  const params = await searchParams;

  const requestedPage = Number(params.page ?? "1");

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const pageSize = 10;

  const defaultCurrency = session.user.defaultCurrency as CurrencyCode;

  /*
   * getExpenses() is responsible for preparing expenses
   * for display in the authenticated user's current
   * default currency.
   *
   * It calculates:
   *
   *   original amount
   *   original currency
   *        ↓
   *   historical/base INR value
   *        ↓
   *   current default currency
   *
   * The original expense amount and currency are never
   * modified.
   */
  const [expenseResult, deletedExpenses] = await Promise.all([
    getExpenses(userId, page, pageSize, "ALL", "ALL", defaultCurrency),
    getDeletedExpensesForUser(userId),
  ]);

  /*
   * getExpenses() already serializes the monetary Decimal
   * values into JavaScript numbers and calculates
   * displayAmount using the user's current default currency.
   *
   * Therefore no additional exchange-rate calculation
   * should happen here.
   */
  const serializedDeletedExpenses = deletedExpenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <ExpensesPageClient
        expenses={expenseResult.expenses}
        deletedExpenses={serializedDeletedExpenses}
        defaultCurrency={defaultCurrency}
        pagination={{
          page: expenseResult.page,
          pageSize: expenseResult.pageSize,
          total: expenseResult.total,
          totalPages: expenseResult.totalPages,
        }}
      />
    </main>
  );
}
