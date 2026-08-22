import { auth } from "@/auth";
import type { CurrencyCode } from "@/constants/currencies";
import { getExpenses } from "@/features/expenses/lib/expenses";

export async function getDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);
  const defaultCurrency = session.user.defaultCurrency as CurrencyCode;

  /*
   * Dashboard is intentionally NOT paginated.
   *
   * The My Expenses page uses pagination because it displays
   * expense cards.
   *
   * Dashboard summary cards, however, must represent ALL
   * expenses belonging to the user.
   *
   * Therefore:
   *
   *   My Expenses → paginated
   *   Dashboard   → all expenses
   */
  const expenseResult = await getExpenses(
    userId,
    1,
    10,
    "ALL",
    "ALL",
    defaultCurrency,
    false,
  );

  const expenses = expenseResult.expenses;

  /*
   * getExpenses() already calculates displayAmount using
   * the user's current default currency.
   *
   * Therefore Dashboard must use displayAmount directly.
   *
   * No additional exchange-rate conversion is required here.
   */
  const totalSpent = expenses.reduce(
    (total, expense) => total + Number(expense.displayAmount),
    0,
  );

  const now = new Date();

  const monthlyExpenses = expenses.filter((expense) => {
    const date = expense.expenseDate ?? expense.createdAt;

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const monthlySpent = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.displayAmount),
    0,
  );

  /*
   * Dashboard shows only the five most recent expenses,
   * but summary calculations above use ALL expenses.
   */
  const recentExpenses = expenses.slice(0, 5).map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,

    /*
     * Original transaction amount.
     */
    amount: Number(expense.amount),

    /*
     * Original transaction currency.
     */
    currency: expense.currency,

    /*
     * Amount converted into the user's current
     * default currency.
     */
    displayAmount: Number(expense.displayAmount),

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
      /*
       * Total of ALL expenses, not just the first
       * pagination page.
       */
      totalSpent,

      /*
       * Total of ALL expenses from the current month.
       */
      monthlySpent,

      /*
       * Total number of expenses, not page size.
       */
      totalExpenses: expenses.length,
    },

    recentExpenses,
  };
}
