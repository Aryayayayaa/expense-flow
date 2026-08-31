import { formatCurrency } from "@/utils/formatCurrency";

import type { getExpenseApprovalHistory } from "@/features/expenses/lib/expenses";

type ApprovalHistoryExpense = Awaited<
  ReturnType<typeof getExpenseApprovalHistory>
>["expenses"][number];

type ApprovalHistoryTableProps = {
  expenses: ApprovalHistoryExpense[];
};

export default function ApprovalHistoryTable({
  expenses,
}: ApprovalHistoryTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 dark:text-white">
          Approvals
        </h2>
        <div className="p-8 text-center text-sm text-slate-700 dark:text-slate-300 dark:text-slate-400">
          No approval history available.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 dark:text-white">
        Approvals
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <tr>
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                Expense
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                Employee
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                Amount
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                Decision
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                Decided By
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                Decision Date
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                Reason
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                  {expense.title}
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {expense.user?.name ?? "Unknown"}
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
                    {expense.user?.email ?? "—"}
                  </div>
                </td>

                <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                  {formatCurrency(expense.amount, expense.currency)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      expense.status === "APPROVED"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                        : expense.status === "REJECTED"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    }`}
                  >
                    {expense.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {expense.decidedBy?.name ?? "Unknown"}
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
                    {expense.decidedBy?.email ?? "—"}
                  </div>
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {expense.decidedAt
                    ? expense.decidedAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>

                <td className="max-w-xs px-5 py-4 text-slate-600">
                  {expense.rejectionReason ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
