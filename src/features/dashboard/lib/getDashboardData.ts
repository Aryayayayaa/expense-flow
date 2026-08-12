import { auth } from "@/auth";
import { getExpenses } from "@/features/expenses/lib/expenses";
import { redirect } from "next/dist/server/api-utils";

export async function getDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  const expenses = await getExpenses(userId);

  const now = new Date();

  const totalSpent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
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
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const recentExpenses = expenses.slice(0, 5).map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,
    amount: Number(expense.amount),
    date: expense.expenseDate ?? expense.createdAt,
  }));

  return {
    user: {
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
