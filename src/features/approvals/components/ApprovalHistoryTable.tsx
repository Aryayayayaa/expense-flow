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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center text-sm text-slate-500">
          No approval history available.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-semibold text-slate-700">
                Expense
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Employee
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">Amount</th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Decision
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Decided By
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">
                Decision Date
              </th>

              <th className="px-5 py-4 font-semibold text-slate-700">Reason</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-900">
                  {expense.title}
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {expense.user?.name ?? "Unknown"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {expense.user?.email ?? "—"}
                  </div>
                </td>

                <td className="px-5 py-4 text-slate-700">
                  {formatCurrency(expense.amount, expense.currency)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      expense.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : expense.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {expense.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {expense.decidedBy?.name ?? "Unknown"}
                  </div>

                  <div className="text-xs text-slate-500">
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
