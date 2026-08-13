import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPendingExpensesForAdmin } from "@/features/expenses/lib/expenses";

import ApprovalList from "@/features/approvals/components/ApprovalList";

export default async function ApprovalsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const expenses = await getPendingExpensesForAdmin();

  const serializedExpenses = expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          Expense Approvals
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review and approve or reject employee expenses.
        </p>
      </div>

      <ApprovalList expenses={serializedExpenses} />
    </main>
  );
}
