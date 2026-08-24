"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveExpenseAction,
  rejectExpenseAction,
  deleteExpenseAsAdminAction,
} from "@/features/expenses/actions/approval-actions";

import AddExpenseForm from "@/features/expenses/components/AddExpenseForm";

import type { DisplayExpense } from "@/features/expenses/types";
import type { AdminExpenseScope } from "@/features/expenses/lib/expenses";

import { formatCurrency } from "@/utils/formatCurrency";

type ApprovalExpense = DisplayExpense & {
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
  } | null;

  decidedBy: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type ApprovalListProps = {
  expenses: ApprovalExpense[];
  expenseScope: AdminExpenseScope;
  currentUserId: number;
};

export default function ApprovalList({
  expenses,
  expenseScope,
  currentUserId,
}: ApprovalListProps) {
  const router = useRouter();

  const [selectedExpense, setSelectedExpense] =
    useState<ApprovalExpense | null>(null);

  const [editingExpense, setEditingExpense] = useState<DisplayExpense | null>(
    null,
  );

  const wasEditing = useRef(false);

  /*
   * Only OWN expenses are allowed to navigate to /expenses/[id].
   *
   * Employee / HR approval expenses stay inside the Review dialog.
   */
  const canNavigateToExpenseDetails = expenseScope === "OWN";

  useEffect(() => {
    if (wasEditing.current && !editingExpense) {
      router.refresh();
    }

    wasEditing.current = editingExpense !== null;
  }, [editingExpense, router]);

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-800">
          No expenses found
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          There are no pending expenses for this scope.
        </p>
      </div>
    );
  }

  function handleExpenseClick(expense: ApprovalExpense) {
    /*
     * OWN:
     *
     * The Admin is viewing their own expense.
     * This follows the same employee-owned expense flow.
     */
    if (canNavigateToExpenseDetails && expense.user?.id === currentUserId) {
      router.push(`/expenses/${expense.id}`);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>

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
                  Date
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Evidence
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => {
                const isOwnExpense = expense.user?.id === currentUserId;

                const isClickable = canNavigateToExpenseDetails && isOwnExpense;

                return (
                  <tr
                    key={expense.id}
                    onClick={() => {
                      if (isClickable) {
                        handleExpenseClick(expense);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (!isClickable) {
                        return;
                      }

                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleExpenseClick(expense);
                      }
                    }}
                    tabIndex={isClickable ? 0 : undefined}
                    role={isClickable ? "link" : undefined}
                    className={`transition ${
                      isClickable
                        ? "cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {expense.user?.name ?? "Unknown"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {expense.user?.email ?? "No email"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {expense.title}
                      </p>

                      <p className="text-xs text-slate-400">#{expense.id}</p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-green-600">
                      {formatCurrency(
                        expense.displayAmount ?? expense.amount,
                        expense.displayAmount !== undefined
                          ? expense.currency
                          : expense.currency,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {expense.category}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {expense.expenseDate
                        ? new Date(expense.expenseDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <EvidenceIndicator expense={expense} />
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        PENDING
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isClickable ? (
                          <>
                            <span className="text-sm font-medium text-blue-600">
                              View expense →
                            </span>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedExpense(expense);
                              }}
                              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                              Review
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedExpense(expense);
                              }}
                              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedExpense && (
        <ReviewExpenseModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onEdit={() => {
            setEditingExpense(selectedExpense);
            setSelectedExpense(null);
          }}
        />
      )}

      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <AddExpenseForm
              editingExpense={editingExpense}
              setEditingExpense={setEditingExpense}
            />
          </div>
        </div>
      )}
    </>
  );
}

function EvidenceIndicator({ expense }: { expense: ApprovalExpense }) {
  const hasReceipt = Boolean(expense.ocrReceiptPath);
  const hasBillProof = Boolean(expense.billProofPath);

  if (!hasReceipt && !hasBillProof) {
    return <span className="text-xs font-medium text-red-600">No proof</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {hasReceipt && (
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          Receipt
        </span>
      )}

      {hasBillProof && (
        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
          Bill
        </span>
      )}
    </div>
  );
}

function ReviewExpenseModal({
  expense,
  onClose,
  onEdit,
}: {
  expense: ApprovalExpense;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");

  async function handleApprove() {
    const confirmed = window.confirm(
      "Are you sure you want to approve this expense?",
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const result = await approveExpenseAction(expense.id);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Approve expense error:", error);
      setMessage("Unable to approve expense.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    const reason = rejectionReason.trim();

    if (!reason) {
      setMessage("Please provide a rejection reason.");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const result = await rejectExpenseAction(expense.id, reason);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Reject expense error:", error);
      setMessage("Unable to reject expense.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete() {
    const reason = deletionReason.trim();

    if (!reason) {
      setMessage("Please provide a deletion reason.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this expense? The expense will be removed from the active expense list and preserved in deleted-expense history.",
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const result = await deleteExpenseAsAdminAction(expense.id, reason);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Admin delete expense error:", error);
      setMessage("Unable to delete expense.");
    } finally {
      setProcessing(false);
    }
  }

  async function openProof(endpoint: string, errorMessage: string) {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? errorMessage);
        return;
      }

      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Proof view error:", error);
      setMessage(errorMessage);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Expense #{expense.id}
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              {expense.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="rounded-lg px-3 py-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close review"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Expense Details
            </h3>

            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <Detail
                label="Employee"
                value={expense.user?.name ?? "Unknown"}
              />

              <Detail label="Email" value={expense.user?.email ?? "—"} />

              <Detail
                label="Amount"
                value={formatCurrency(expense.amount, expense.currency)}
              />

              <Detail label="Category" value={expense.category} />

              <Detail
                label="Expense Date"
                value={
                  expense.expenseDate
                    ? new Date(expense.expenseDate).toLocaleDateString()
                    : "—"
                }
              />

              <Detail label="Status" value={expense.status} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Supporting Documents
            </h3>

            <div className="flex flex-wrap gap-3">
              {expense.ocrReceiptPath && (
                <button
                  type="button"
                  onClick={() =>
                    openProof(
                      `/api/expenses/${expense.id}/ocr-receipt`,
                      "Unable to open original receipt.",
                    )
                  }
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  View Original Receipt
                </button>
              )}

              {expense.billProofPath && (
                <button
                  type="button"
                  onClick={() =>
                    openProof(
                      `/api/expenses/${expense.id}/bill-proof`,
                      "Unable to open bill proof.",
                    )
                  }
                  className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
                >
                  View Bill Proof
                </button>
              )}

              {!expense.ocrReceiptPath && !expense.billProofPath && (
                <p className="text-sm text-red-600">
                  No supporting documents have been uploaded.
                </p>
              )}
            </div>
          </section>

          {expense.ocrRawText && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                OCR Extracted Information
              </h3>

              <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {expense.ocrRawText}
              </div>
            </section>
          )}

          {showReject && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <label
                htmlFor={`rejection-${expense.id}`}
                className="block text-sm font-semibold text-red-900"
              >
                Rejection Reason
              </label>

              <textarea
                id={`rejection-${expense.id}`}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                disabled={processing}
                rows={4}
                placeholder="Explain why this expense is being rejected..."
                className="mt-2 w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-red-400"
              />

              <button
                type="button"
                disabled={processing}
                onClick={handleReject}
                className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </section>
          )}

          {showDelete && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <label
                htmlFor={`deletion-${expense.id}`}
                className="block text-sm font-semibold text-red-900"
              >
                Deletion Reason
              </label>

              <p className="mt-1 text-xs text-red-700">
                This reason will be permanently stored with the deleted expense
                history.
              </p>

              <textarea
                id={`deletion-${expense.id}`}
                value={deletionReason}
                onChange={(event) => setDeletionReason(event.target.value)}
                disabled={processing}
                rows={4}
                placeholder="Explain why this expense is being deleted..."
                className="mt-2 w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-red-400"
              />

              <button
                type="button"
                disabled={processing}
                onClick={handleDelete}
                className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? "Deleting..." : "Confirm Delete"}
              </button>
            </section>
          )}

          {message && (
            <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onEdit}
            disabled={processing}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit Expense
          </button>

          {!showReject && (
            <button
              type="button"
              onClick={() => setShowReject(true)}
              disabled={processing}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject
            </button>
          )}

          {!showDelete && (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              disabled={processing}
              className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={handleApprove}
            disabled={processing}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
