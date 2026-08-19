import ExpensesPageClient from "@/features/expenses/components/ExpensesPageClient";

import {
  getDeletedExpensesForUser,
  getExpenses,
} from "@/features/expenses/lib/expenses";

import { auth } from "@/auth";

export default async function ExpensesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);

  const [expenseResult, deletedExpenses] = await Promise.all([
    getExpenses(userId),
    getDeletedExpensesForUser(userId),
  ]);

  const serializedExpenses = expenseResult.expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

  const serializedDeletedExpenses = deletedExpenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <ExpensesPageClient
        expenses={serializedExpenses}
        deletedExpenses={serializedDeletedExpenses}
      />
    </main>
  );
}
