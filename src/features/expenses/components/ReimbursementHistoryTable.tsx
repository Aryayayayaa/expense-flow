type ReimbursementHistoryExpense = {
  id: number;
  title: string;
  amount: unknown;
  category: string;
  decidedAt: Date | null;
  reimbursementAt: Date | null;

  user: {
    id: number;
    name: string;
    email: string;
  } | null;

  decidedBy: {
    id: number;
    name: string;
    email: string;
  } | null;

  reimbursementBy: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type Props = {
  expenses: ReimbursementHistoryExpense[];
};

export default function ReimbursementHistoryTable({ expenses }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No reimbursement history available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500">Employee</th>

              <th className="px-5 py-4 font-medium text-slate-500">Expense</th>

              <th className="px-5 py-4 font-medium text-slate-500">Amount</th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Approved By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Approved On
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Reimbursed By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Reimbursed On
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">
                    {expense.user?.name ?? "Unknown employee"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {expense.user?.email ?? ""}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{expense.title}</p>

                  <p className="text-xs text-slate-500">{expense.category}</p>
                </td>

                <td className="px-5 py-4 font-semibold text-slate-900">
                  ₹{Number(expense.amount).toFixed(2)}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {expense.decidedBy?.name ?? "Unknown"}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {expense.decidedAt
                    ? new Date(expense.decidedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {expense.reimbursementBy?.name ?? "Unknown"}
                </td>

                <td className="px-5 py-4 text-slate-600">
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
