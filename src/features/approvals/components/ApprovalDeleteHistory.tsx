import { formatCurrency } from "@/utils/formatCurrency";

type DeletedExpense = {
  id: number;
  originalExpenseId: number;
  title: string;
  amount: number;
  currency: string;
  category: string;
  expenseDate: Date | null;
  deletionReason: string;
  deletedAt: Date;

  user: {
    id: number;
    name: string;
    email: string;
  };

  deletedBy: {
    id: number;
    name: string;
    email: string;
  };
};

type ApprovalDeleteHistoryProps = {
  expenses: DeletedExpense[];

  /**
   * ADMIN / HR:
   * Show the employee who originally owned the deleted expense.
   *
   * EMPLOYEE:
   * Hide the employee column because the table already contains
   * only the currently logged-in employee's deleted expenses.
   */
  showEmployee?: boolean;
};

export default function ApprovalDeleteHistory({
  expenses,
  showEmployee = true,
}: ApprovalDeleteHistoryProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-800">
          No deleted expenses
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {showEmployee
            ? "No expenses have been deleted by an Admin yet."
            : "You do not have any deleted expenses."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table
          className={`w-full text-left ${
            showEmployee ? "min-w-[1100px]" : "min-w-[950px]"
          }`}
        >
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {showEmployee && (
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
              )}

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expense
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Deleted By
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Deleted At
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="transition hover:bg-slate-50">
                {showEmployee && (
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {expense.user.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {expense.user.email}
                    </p>
                  </td>
                )}

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{expense.title}</p>

                  <p className="text-xs text-slate-400">
                    Original #{expense.originalExpenseId}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                  {formatCurrency(expense.amount, expense.currency)}
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {expense.category}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">
                    {expense.deletedBy.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {expense.deletedBy.email}
                  </p>
                </td>

                <td className="max-w-xs px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {expense.deletionReason}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {new Date(expense.deletedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
