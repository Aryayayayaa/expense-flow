import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  getExpenses,
  getPendingExpensesForAdmin,
} from "@/features/expenses/lib/expenses";

import ApprovalList from "@/features/approvals/components/ApprovalList";

export default async function ApprovalsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const role = session.user.role;

  /*
   * ADMIN
   *
   * Admins review other users' pending expenses.
   */
  if (role === "ADMIN") {
    const expenses = await getPendingExpensesForAdmin();

    const serializedExpenses = expenses
      .filter((expense) => expense.userId !== userId)
      .map((expense) => ({
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

  /*
   * EMPLOYEE / HR
   *
   * They cannot approve expenses.
   * They only see the status of their own expenses.
   */
  const expenses = await getExpenses(userId);

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          My Expense Status
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the approval status of your submitted expenses.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            You have not submitted any expenses yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Expense
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Amount
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Category
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Date
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Status
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Decision Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {expense.title}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.category}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.expenseDate
                        ? expense.expenseDate.toLocaleDateString("en-GB")
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          expense.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : expense.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : expense.status === "REIMBURSED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {expense.status}
                      </span>

                      {expense.status === "REJECTED" &&
                        expense.rejectionReason && (
                          <p className="mt-1 max-w-xs text-xs text-red-600">
                            {expense.rejectionReason}
                          </p>
                        )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.decidedAt
                        ? expense.decidedAt.toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
