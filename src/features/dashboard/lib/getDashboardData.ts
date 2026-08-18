import { auth } from "@/auth";
import { getExpenses } from "@/features/expenses/lib/expenses";

export async function getDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  const expenses = await getExpenses(userId);

  const now = new Date();

  function getBaseCurrencyAmount(expense: {
    amount: unknown;
    currency: string;
    baseCurrencyAmount: unknown;
  }) {
    if (expense.baseCurrencyAmount !== null) {
      return Number(expense.baseCurrencyAmount);
    }

    // Existing INR expenses created before multi-currency support
    // do not have baseCurrencyAmount populated.
    if (expense.currency === "INR") {
      return Number(expense.amount);
    }

    return 0;
  }

  /*
   * Dashboard totals are stored in the application's base currency (INR).
   *
   * Individual expenses retain their original amount/currency.
   * baseCurrencyAmount is the normalized value used for aggregation.
   */
  const totalSpent = expenses.reduce(
    (total, expense) => total + getBaseCurrencyAmount(expense),
    0,
  );

  const monthlyExpenses = expenses.filter((expense) => {
    const date = expense.expenseDate ?? expense.createdAt;

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const monthlySpent = monthlyExpenses.reduce(
    (total, expense) => total + getBaseCurrencyAmount(expense),
    0,
  );

  const recentExpenses = expenses.slice(0, 5).map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,

    // Original transaction amount.
    amount: Number(expense.amount),

    // Original transaction currency.
    currency: expense.currency,

    // Normalized INR value.
    baseCurrencyAmount: getBaseCurrencyAmount(expense),

    // Useful later when the dashboard gets a display-currency filter.
    exchangeRate: Number(expense.exchangeRate ?? 1),

    date: expense.expenseDate ?? expense.createdAt,
  }));

  return {
    user: {
      id: Number(session.user.id),
      name: session.user.name ?? "User",
      email: session.user.email ?? "",
    },

    summary: {
      totalSpent,
      monthlySpent,
      totalExpenses: expenses.length,
    },

    recentExpenses,
  };
}
