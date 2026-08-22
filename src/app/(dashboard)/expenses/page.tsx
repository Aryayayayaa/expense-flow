import ExpensesPageClient from "@/features/expenses/components/ExpensesPageClient";
import type { CurrencyCode } from "@/constants/currencies";

import {
  getAllExpensesForUser,
  getDeletedExpensesForUser,
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

  const defaultCurrency = session.user.defaultCurrency as CurrencyCode;

  /*
   * IMPORTANT:
   *
   * The Expenses page intentionally loads ALL expenses here.
   *
   * Pagination must happen AFTER the client-side filters are applied.
   *
   * Otherwise:
   *
   *   DB pagination
   *        ↓
   *   current page only
   *        ↓
   *   filtering
   *
   * causes filtered expenses and summary cards to incorrectly
   * depend on which database page happens to be displayed.
   *
   * The correct flow is:
   *
   *   ALL expenses
   *        ↓
   *   filters
   *        ↓
   *   summary calculations
   *        ↓
   *   pagination
   */
  const [expenses, deletedExpenses] = await Promise.all([
    getAllExpensesForUser(userId, defaultCurrency),
    getDeletedExpensesForUser(userId),
  ]);

  const serializedDeletedExpenses = deletedExpenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <ExpensesPageClient
        expenses={expenses}
        deletedExpenses={serializedDeletedExpenses}
        defaultCurrency={defaultCurrency}
        initialPage={page}
      />
    </main>
  );
}
