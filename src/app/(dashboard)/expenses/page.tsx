import ExpensesPageClient from "@/features/expenses/components/ExpensesPageClient";

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

  const [expenseResult, deletedExpenses] = await Promise.all([
    getExpenses(userId, page, pageSize),
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
