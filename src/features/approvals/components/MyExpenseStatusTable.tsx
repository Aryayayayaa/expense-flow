"use client";

import { useRouter } from "next/navigation";

import { formatCurrency } from "@/utils/formatCurrency";
import type { getExpenses } from "@/features/expenses/lib/expenses";
import { deleteExpenseAction } from "@/features/expenses/actions/expense-actions";

type Expense = Awaited<ReturnType<typeof getExpenses>>["expenses"][number];

type MyExpenseStatusTableProps = {
  expenses: Expense[];
};

export default function MyExpenseStatusTable({
  expenses,
}: MyExpenseStatusTableProps) {
  const router = useRouter();

  if (expenses.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center text-sm text-slate-500">
          You have not submitted any expenses yet.
        </div>
      </div>
    );
  }

  function handleExpenseClick(expenseId: number) {
    router.push(`/expenses/${expenseId}`);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-semibold text-slate-700">
                Expense
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">Amount</th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Category
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">Date</th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Approval Status
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Reimbursement Status
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Decision Date
              </th>

              <th className="px-5 py-4 text-right font-semibold text-slate-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                onClick={() => handleExpenseClick(expense.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleExpenseClick(expense.id);
                  }
                }}
                tabIndex={0}
                role="link"
                className="cursor-pointer transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label={`View expense ${expense.title}`}
              >
                {/* Expense */}
                <td className="px-5 py-4">
                  <span className="font-medium text-slate-900">
                    {expense.title}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-5 py-4 text-slate-700">
                  {formatCurrency(expense.amount, expense.currency)}
                </td>

                {/* Category */}
                <td className="px-5 py-4 text-slate-600">{expense.category}</td>

                {/* Date */}
                <td className="px-5 py-4 text-slate-600">
                  {expense.expenseDate
                    ? expense.expenseDate.toLocaleDateString("en-GB")
                    : "—"}
                </td>

                {/* Approval Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      expense.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : expense.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {expense.status}
                  </span>

                  {expense.status === "REJECTED" && expense.rejectionReason && (
                    <p className="mt-1 max-w-xs text-xs text-red-600">
                      {expense.rejectionReason}
                    </p>
                  )}
                </td>

                {/* Reimbursement Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      expense.reimbursementStatus === "REIMBURSED"
                        ? "bg-green-100 text-green-700"
                        : expense.reimbursementStatus === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {expense.reimbursementStatus}
                  </span>
                </td>

                {/* Decision Date */}
                <td className="px-5 py-4 text-slate-600">
                  {expense.decidedAt
                    ? expense.decidedAt.toLocaleDateString("en-GB")
                    : "—"}
                </td>

                <td className="px-5 py-4 text-right">
                  {expense.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={async (event) => {
                        event.stopPropagation();

                        const confirmed = window.confirm(
                          "Are you sure you want to delete this pending expense?",
                        );

                        if (!confirmed) {
                          return;
                        }

                        try {
                          await deleteExpenseAction(expense.id);
                          router.refresh();
                        } catch (error) {
                          console.error("Delete expense error:", error);

                          window.alert(
                            error instanceof Error
                              ? error.message
                              : "Unable to delete expense.",
                          );
                        }
                      }}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
