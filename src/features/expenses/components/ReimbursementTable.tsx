"use client";

import { useState } from "react";

import { reimburseExpenseAction } from "../actions/reimbursement-actions";

type ReimbursementExpense = {
  id: number;
  title: string;
  amount: unknown;
  category: string;
  expenseDate: Date | null;
  decidedAt: Date | null;
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
};

type Props = {
  expenses: ReimbursementExpense[];
};

export default function ReimbursementTable({ expenses }: Props) {
  const [items, setItems] = useState(expenses);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function handleReimburse(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to mark this expense as reimbursed?",
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(id);
    setMessage("");

    const result = await reimburseExpenseAction(id);

    setMessage(result.message);

    if (result.success) {
      setItems((current) => current.filter((expense) => expense.id !== id));
    }

    setProcessingId(null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No approved expenses are waiting for reimbursement.
        </p>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-500">
                  Employee
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Expense
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">Amount</th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Approved By
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Approved On
                </th>

                <th className="px-5 py-4 text-right font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((expense) => {
                const processing = processingId === expense.id;

                return (
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
                      <p className="font-medium text-slate-900">
                        {expense.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {expense.category}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.decidedBy?.name ?? "Unknown"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.decidedAt
                        ? new Date(expense.decidedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "-"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleReimburse(expense.id)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Mark as Reimbursed"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
