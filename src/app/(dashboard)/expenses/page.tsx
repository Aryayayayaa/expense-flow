import ExpensesPageClient from "@/features/expenses/components/ExpensesPageClient";
import type { CurrencyCode } from "@/constants/currencies";
import { getExchangeRate } from "@/features/expenses/lib/exchange-rates";

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
   * baseCurrencyAmount is stored in INR.
   *
   * When the user's current default currency is not INR,
   * we need the rate:
   *
   *     1 DEFAULT_CURRENCY = X INR
   *
   * so that:
   *
   *     INR amount / X = DEFAULT_CURRENCY amount
   */
  const displayRateToInr =
    defaultCurrency === "INR"
      ? 1
      : (await getExchangeRate(defaultCurrency, "INR")).rate;

  const [expenseResult, deletedExpenses] = await Promise.all([
    getExpenses(userId, page, pageSize, "ALL", "ALL", defaultCurrency),
    getDeletedExpensesForUser(userId),
  ]);

  const serializedExpenses = expenseResult.expenses.map((expense) => {
    const amount = Number(expense.amount);

    /*
     * If the original expense currency is already the
     * user's current default currency, no conversion is required.
     */
    if (expense.currency === defaultCurrency) {
      return {
        ...expense,
        amount,
        displayAmount: amount,
      };
    }

    /*
     * baseCurrencyAmount is the historical INR-normalized
     * value stored when the expense was created.
     *
     * For older INR expenses created before baseCurrencyAmount
     * existed, the original INR amount is the base amount.
     */
    const baseCurrencyAmount =
      expense.baseCurrencyAmount !== null
        ? Number(expense.baseCurrencyAmount)
        : expense.currency === "INR"
          ? amount
          : null;

    /*
     * If we cannot determine a normalized amount, fall back
     * to the original amount rather than silently converting
     * an unknown value.
     */
    const displayAmount =
      baseCurrencyAmount === null
        ? amount
        : defaultCurrency === "INR"
          ? baseCurrencyAmount
          : baseCurrencyAmount / displayRateToInr;

    return {
      ...expense,
      amount,
      displayAmount,
    };
  });

  const serializedDeletedExpenses = deletedExpenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <ExpensesPageClient
        expenses={serializedExpenses}
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
