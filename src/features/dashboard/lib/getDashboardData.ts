import { auth } from "@/auth";
import type { CurrencyCode } from "@/constants/currencies";
import { getExchangeRate } from "@/features/expenses/lib/exchange-rates";
import { getExpenses } from "@/features/expenses/lib/expenses";

export async function getDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);
  const defaultCurrency = session.user.defaultCurrency as CurrencyCode;

  const expenseResult = await getExpenses(
    userId,
    1,
    10,
    "ALL",
    "ALL",
    defaultCurrency,
  );

  const expenses = expenseResult.expenses;

  /*
   * Keep Dashboard conversion logic identical to /expenses.
   *
   * baseCurrencyAmount is stored in INR.
   *
   * For a non-INR default currency:
   *
   *   INR amount / (default currency -> INR rate)
   *
   * gives the default-currency amount.
   *
   * We fetch the rate ONCE so every expense uses exactly
   * the same conversion rate.
   */
  const displayRateToInr =
    defaultCurrency === "INR"
      ? 1
      : (await getExchangeRate(defaultCurrency, "INR")).rate;

  const getDashboardDisplayAmount = (expense: (typeof expenses)[number]) => {
    const amount = Number(expense.amount);

    /*
     * If the expense was originally saved in the user's
     * current default currency, preserve the original amount.
     */
    if (expense.currency === defaultCurrency) {
      return amount;
    }

    /*
     * Use the stored INR-normalized value.
     *
     * Older INR expenses may not have baseCurrencyAmount,
     * so fall back to their original amount.
     */
    const baseCurrencyAmount =
      expense.baseCurrencyAmount !== null
        ? Number(expense.baseCurrencyAmount)
        : expense.currency === "INR"
          ? amount
          : null;

    /*
     * If no normalized value exists, preserve the original
     * amount rather than silently applying an incorrect rate.
     */
    if (baseCurrencyAmount === null) {
      return amount;
    }

    return defaultCurrency === "INR"
      ? baseCurrencyAmount
      : baseCurrencyAmount / displayRateToInr;
  };

  /*
   * Calculate Dashboard totals using the exact same
   * display-currency logic as /expenses.
   */
  const totalSpent = expenses.reduce(
    (total: number, expense: (typeof expenses)[number]) =>
      total + getDashboardDisplayAmount(expense),
    0,
  );

  const now = new Date();

  const monthlyExpenses = expenses.filter(
    (expense: (typeof expenses)[number]) => {
      const date = expense.expenseDate ?? expense.createdAt;

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    },
  );

  const monthlySpent = monthlyExpenses.reduce(
    (total: number, expense: (typeof expenses)[number]) =>
      total + getDashboardDisplayAmount(expense),
    0,
  );

  /*
   * Recent expenses preserve:
   *
   * - displayAmount → user's current default currency
   * - amount/currency → original transaction value
   */
  const recentExpenses = expenses.slice(0, 5).map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,

    // Original transaction amount.
    amount: Number(expense.amount),

    // Original transaction currency.
    currency: expense.currency,

    // Current default-currency display amount.
    displayAmount: getDashboardDisplayAmount(expense),

    date: expense.expenseDate ?? expense.createdAt,
  }));

  return {
    user: {
      id: userId,
      name: session.user.name ?? "User",
      email: session.user.email ?? "",
    },

    defaultCurrency,

    summary: {
      totalSpent,
      monthlySpent,
      totalExpenses: expenses.length,
    },

    recentExpenses,
  };
}
