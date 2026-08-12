import { auth } from "@/auth";
import { getExpenses } from "@/features/expenses/lib/expenses";

import { AnalyticsExpense } from "../types";

export async function getAnalyticsData(): Promise<AnalyticsExpense[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  const expenses = await getExpenses(userId);

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));
}
