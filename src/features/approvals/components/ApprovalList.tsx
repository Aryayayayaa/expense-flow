"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveExpenseAction,
  rejectExpenseAction,
  deleteExpenseAsAdminAction,
} from "@/features/expenses/actions/approval-actions";

import AddExpenseForm from "@/features/expenses/components/AddExpenseForm";
import AppDialog from "@/components/common/AppDialog";
import ActionSpinner from "@/components/common/ActionSpinner";

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

type DialogState =
  | {
      type: "approve";
    }
  | {
      type: "error";
      message: string;
    }
  | null;

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
                        expense.currency,
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
                          <span className="text-sm font-medium text-blue-600">
                            View expense →
                          </span>
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

  if (!hasReceipt) {
    return <span className="text-xs font-medium text-red-600">No proof</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        Receipt
      </span>
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

  const [processingAction, setProcessingAction] = useState<
    "approve" | "reject" | "delete" | null
  >(null);

  const [message, setMessage] = useState("");

  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");

  const [dialog, setDialog] = useState<DialogState>(null);

  async function handleApprove() {
    if (processing) {
      return;
    }

    setProcessing(true);
    setProcessingAction("approve");
    setMessage("");

    try {
      const result = await approveExpenseAction(expense.id);

      if (!result.success) {
        setMessage(result.message);
        setDialog(null);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Approve expense error:", error);
      setMessage("Unable to approve expense.");
      setDialog(null);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  }

  async function handleReject() {
    if (processing) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setMessage("Please provide a rejection reason.");
      return;
    }

    setProcessing(true);
    setProcessingAction("reject");
    setMessage("");

    try {
      const result = await rejectExpenseAction(expense.id, reason);

      if (!result.success) {
        setMessage(result.message);
        setDialog(null);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Reject expense error:", error);
      setMessage("Unable to reject expense.");
      setDialog(null);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  }

  async function handleDelete() {
    if (processing) {
      return;
    }

    const reason = deletionReason.trim();

    if (!reason) {
      setMessage("Please provide a deletion reason.");
      return;
    }

    setProcessing(true);
    setProcessingAction("delete");
    setMessage("");

    try {
      const result = await deleteExpenseAsAdminAction(expense.id, reason);

      if (!result.success) {
        setMessage(result.message);
        setDialog(null);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Admin delete expense error:", error);
      setMessage("Unable to delete expense.");
      setDialog(null);
    } finally {
      setProcessing(false);
      setProcessingAction(null);
    }
  }

  async function openProof(endpoint: string, errorMessage: string) {
    if (processing) {
      return;
    }

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

  const dialogLoadingLabel =
    processingAction === "approve"
      ? "Approving..."
      : processingAction === "reject"
        ? "Rejecting..."
        : processingAction === "delete"
          ? "Deleting..."
          : "Processing...";

  return (
    <>
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
              className="rounded-lg px-3 py-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  value={formatCurrency(
                    expense.displayAmount ?? expense.amount,
                    expense.currency,
                  )}
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
                    disabled={processing}
                    onClick={() =>
                      openProof(
                        `/api/expenses/${expense.id}/ocr-receipt`,
                        "Unable to open original receipt.",
                      )
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View Original Receipt
                  </button>
                )}

                {!expense.ocrReceiptPath && (
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
                  className="mt-2 w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      setMessage("Please provide a rejection reason.");
                      return;
                    }

                    setDialog({
                      type: "approve",
                    });
                  }}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processingAction === "reject" && <ActionSpinner size="sm" />}

                  {processingAction === "reject"
                    ? "Rejecting..."
                    : "Confirm Rejection"}
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
                  This reason will be permanently stored with the deleted
                  expense history.
                </p>

                <textarea
                  id={`deletion-${expense.id}`}
                  value={deletionReason}
                  onChange={(event) => setDeletionReason(event.target.value)}
                  disabled={processing}
                  rows={4}
                  placeholder="Explain why this expense is being deleted..."
                  className="mt-2 w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    if (!deletionReason.trim()) {
                      setMessage("Please provide a deletion reason.");
                      return;
                    }

                    setDialog({
                      type: "approve",
                    });
                  }}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processingAction === "delete" && <ActionSpinner size="sm" />}

                  {processingAction === "delete"
                    ? "Deleting..."
                    : "Confirm Delete"}
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
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                onClick={() => {
                  setShowDelete(false);
                  setShowReject(true);
                  setMessage("");
                }}
                disabled={processing}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
            )}

            {!showDelete && (
              <button
                type="button"
                onClick={() => {
                  setShowReject(false);
                  setShowDelete(true);
                  setMessage("");
                }}
                disabled={processing}
                className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (processing) {
                  return;
                }

                setDialog({
                  type: "approve",
                });
              }}
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processingAction === "approve" && <ActionSpinner size="sm" />}

              {processingAction === "approve" ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      </div>

      <AppDialog
        open={dialog?.type === "approve"}
        title={
          showReject
            ? "Reject Expense"
            : showDelete
              ? "Delete Expense"
              : "Approve Expense"
        }
        description={
          showReject
            ? "Are you sure you want to reject this expense with the provided reason?"
            : showDelete
              ? "Are you sure you want to delete this expense? The expense will be removed from the active expense list and preserved in deleted-expense history."
              : "Are you sure you want to approve this expense?"
        }
        variant={showReject || showDelete ? "danger" : "success"}
        confirmLabel={showReject ? "Reject" : showDelete ? "Delete" : "Approve"}
        cancelLabel="Cancel"
        loading={processing}
        loadingLabel={dialogLoadingLabel}
        onCancel={() => {
          if (!processing) {
            setDialog(null);
          }
        }}
        onConfirm={() => {
          if (processing) {
            return;
          }

          if (showReject) {
            void handleReject();
            return;
          }

          if (showDelete) {
            void handleDelete();
            return;
          }

          void handleApprove();
        }}
      />
    </>
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
