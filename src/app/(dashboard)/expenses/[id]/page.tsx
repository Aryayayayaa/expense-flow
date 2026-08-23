import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";

import {
  getExpense,
  getExpenseForAdmin,
} from "@/features/expenses/lib/expenses";

type ExpensePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpensePage({ params }: ExpensePageProps) {
  const { id } = await params;

  /*
   * Reject invalid IDs before making a database query.
   *
   * Examples:
   * /expenses/-3484
   * /expenses/abc
   * /expenses/12abc
   */
  const expenseId = Number(id);

  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    notFound();
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const role = session.user.role;

  /*
   * Employees can only view their own expenses.
   *
   * Admin and HR can view expenses belonging to other users.
   */
  const expense =
    role === "ADMIN" || role === "HR"
      ? await getExpenseForAdmin(expenseId)
      : await getExpense(expenseId, userId);

  /*
   * The expense may have been deleted or the ID may simply
   * not exist.
   */
  if (!expense) {
    notFound();
  }

  return (
    <main className="p-6 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Expense Details
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Expense ID: {expense.id}
        </p>
      </div>
    </main>
  );
}
