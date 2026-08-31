"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import type { ReimbursementHistoryExpense } from "../lib/expenses";

type Props = {
  expenses: ReimbursementHistoryExpense[];
};

export default function ReimbursementHistoryTable({ expenses }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No reimbursement history available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Employee
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Expense
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Amount
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Expense Status
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Reimbursement Status
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Approved By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Approved On
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Processed By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                Processed On
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map((expense) => (
              <tr
  key={expense.id}
  className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
>
                {/* Employee */}
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {expense.user?.name ?? "Unknown employee"}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {expense.user?.email ?? ""}
                  </p>
                </td>

                {/* Expense */}
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{expense.title}</p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">{expense.category}</p>
                </td>

                {/* Amount */}
                <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(expense.amount, expense.currency)}
                </td>

                {/* Expense Status */}
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

                  {expense.reimbursementStatus === "REJECTED" &&
                    expense.reimbursementReason && (
                      <p className="mt-2 max-w-xs text-xs text-red-600 dark:text-red-400">
                        {expense.reimbursementReason}
                      </p>
                    )}
                </td>

                {/* Approved By */}
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                  {expense.decidedBy?.name ?? "Unknown"}
                </td>

                {/* Approved On */}
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                  {expense.decidedAt
                    ? new Date(expense.decidedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </td>

                {/* Processed By */}
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                  {expense.reimbursementBy?.name ?? "Unknown"}
                </td>

                {/* Processed On */}
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                  {expense.reimbursementAt
                    ? new Date(expense.reimbursementAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
