// MyExpenseStatusTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatCurrency } from "@/utils/formatCurrency";
import type { getExpenses } from "@/features/expenses/lib/expenses";
//import { deleteExpenseAction } from "@/features/expenses/actions/expense-actions";
import AppDialog from "@/components/common/AppDialog";

type Expense = Awaited<ReturnType<typeof getExpenses>>["expenses"][number];

type MyExpenseStatusTableProps = {
  expenses: Expense[];
};

export default function MyExpenseStatusTable({
  expenses,
}: MyExpenseStatusTableProps) {
  const router = useRouter();

  const [deleteExpenseId, setDeleteExpenseId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  if (expenses.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <div className="p-8 text-center text-sm text-slate-500">
          You have not submitted any expenses yet.
        </div>
      </div>
    );
  }

  function handleExpenseClick(expenseId: number) {
    if (deleting) {
      return;
    }

    router.push(`/expenses/${expenseId}`);
  }

  async function handleDelete() {
    if (deleteExpenseId === null || deleting) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/expenses/${deleteExpenseId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete expense.");
      }

      setDeleteExpenseId(null);
      router.refresh();
    } catch (error) {
      console.error("Delete expense error:", error);

      setMessage(
        error instanceof Error ? error.message : "Unable to delete expense.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Expense
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Amount
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Category
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Date
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Approval Status
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Reimbursement Status
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Decision Date
                </th>

                <th className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
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
                  className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-label={`View expense ${expense.title}`}
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {expense.title}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300 dark:text-slate-200">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-white">
                    {expense.category}
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-white">
                    {expense.expenseDate
                      ? expense.expenseDate.toLocaleDateString("en-GB")
                      : "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        expense.status === "APPROVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                          : expense.status === "REJECTED"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300"
                      }`}
                    >
                      {expense.status}
                    </span>

                    {expense.status === "REJECTED" &&
                      expense.rejectionReason && (
                        <p className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-400">
                          {expense.rejectionReason}
                        </p>
                      )}
                  </td>

                  <td className="px-5 py-4">
                    {expense.status === "REJECTED" ? (
                      <span className="text-slate-600 text-center">—</span>
                    ) : (
                      <>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            expense.reimbursementStatus === "REIMBURSED"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                              : expense.reimbursementStatus === "REJECTED"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300"
                          }`}
                        >
                          {expense.reimbursementStatus}
                        </span>

                        {expense.reimbursementStatus === "REJECTED" &&
                          expense.reimbursementReason && (
                            <p className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-400">
                              {expense.reimbursementReason}
                            </p>
                          )}
                      </>
                    )}
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-white">
                    {expense.decidedAt
                      ? expense.decidedAt.toLocaleDateString("en-GB")
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {expense.status === "PENDING" && (
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={(event) => {
                          event.stopPropagation();

                          if (deleting) {
                            return;
                          }

                          setMessage("");
                          setDeleteExpenseId(expense.id);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 "
                      >
                        {deleting && deleteExpenseId === expense.id ? (
                          <>
                            <span
                              className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600 dark:border-red-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
                              aria-hidden="true"
                            />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <AppDialog
        open={deleteExpenseId !== null}
        title="Delete Expense"
        description="Are you sure you want to delete this pending expense?"
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        loadingLabel="Deleting Expense..."
        onCancel={() => {
          if (!deleting) {
            setDeleteExpenseId(null);
          }
        }}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}
