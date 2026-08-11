import ExpensesPageClient from "@/features/expenses/components/ExpensesPageClient";

import { getExpenses } from "@/features/expenses/lib/expenses";

import { auth } from "@/auth";

export default async function ExpensesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }
  const expenses = await getExpenses(Number(session.user.id));

  const serializedExpenses = expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

   return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <ExpensesPageClient expenses={serializedExpenses} />
    </main>
  );
}