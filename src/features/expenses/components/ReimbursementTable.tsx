"use client";

import { useEffect, useState } from "react";

import {
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  ReceiptText,
  User,
  X,
  XCircle,
} from "lucide-react";

import {
  reimburseExpenseAction,
  rejectReimbursementAction,
} from "../actions/reimbursement-actions";

import { formatCurrency } from "@/utils/formatCurrency";
import AppDialog from "@/components/common/AppDialog";

export type ReimbursementExpense = {
  id: number;
  title: string;
  amount: unknown;
  currency: string;
  category: string;
  vendor: string | null;
  expenseDate: Date | null;

  status: "PENDING" | "APPROVED" | "REJECTED";

  reimbursementStatus: "PENDING" | "REIMBURSED" | "REJECTED";

  billProofUrl: string | null;
  billProofPath: string | null;

  ocrReceiptUrl: string | null;
  ocrReceiptPath: string | null;

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

type DialogType = "reimburse" | "reject" | "error" | null;

export default function ReimbursementTable({ expenses }: Props) {
  const [items, setItems] = useState(expenses);

  const [selectedExpense, setSelectedExpense] =
    useState<ReimbursementExpense | null>(null);

  const [processingId, setProcessingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");

  const [rejectionReason, setRejectionReason] = useState("");

  const [dialog, setDialog] = useState<DialogType>(null);

  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    setItems(expenses);
  }, [expenses]);

  function closeDialog() {
    if (processingId !== null) {
      return;
    }

    setDialog(null);
    setDialogMessage("");
  }

  function closeReview() {
    if (processingId !== null) {
      return;
    }

    setSelectedExpense(null);
    setRejectionReason("");
    setMessage("");
  }

  function requestReimburse(id: number) {
    if (processingId !== null) {
      return;
    }

    setDialogMessage("Are you sure you want to reimburse this expense?");

    setDialog("reimburse");
  }

  function requestReject(id: number) {
    const reason = rejectionReason.trim();

    if (!reason) {
      setDialogMessage(
        "Please provide a reason for rejecting the reimbursement.",
      );
      setDialog("error");
      return;
    }

    if (processingId !== null) {
      return;
    }

    setDialogMessage(
      "Are you sure you want to reject reimbursement for this expense?",
    );

    setDialog("reject");
  }

  async function handleReimburse() {
    if (!selectedExpense || processingId !== null) {
      return;
    }

    const id = selectedExpense.id;

    setDialog(null);
    setProcessingId(id);
    setMessage("");

    try {
      const result = await reimburseExpenseAction(id);

      setMessage(result.message);

      if (result.success) {
        setItems((current) => current.filter((expense) => expense.id !== id));

        setSelectedExpense(null);
        setRejectionReason("");
      } else {
        setDialogMessage(result.message);
        setDialog("error");
      }
    } catch (error) {
      console.error("Reimburse expense error:", error);

      setDialogMessage("Unable to reimburse this expense.");
      setDialog("error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject() {
    if (!selectedExpense || processingId !== null) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setDialogMessage(
        "Please provide a reason for rejecting the reimbursement.",
      );
      setDialog("error");
      return;
    }

    const id = selectedExpense.id;

    setDialog(null);
    setProcessingId(id);
    setMessage("");

    try {
      const result = await rejectReimbursementAction(id, reason);

      setMessage(result.message);

      if (result.success) {
        setItems((current) => current.filter((expense) => expense.id !== id));

        setSelectedExpense(null);
        setRejectionReason("");
      } else {
        setDialogMessage(result.message);
        setDialog("error");
      }
    } catch (error) {
      console.error("Reject reimbursement error:", error);

      setDialogMessage("Unable to reject this reimbursement.");
      setDialog("error");
    } finally {
      setProcessingId(null);
    }
  }

  async function openProof(
    expenseId: number,
    type: "ocr-receipt" | "bill-proof",
  ) {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/${type}`);

      const data = await response.json();

      if (!response.ok) {
        setDialogMessage(data.error ?? "Unable to open the expense proof.");
        setDialog("error");
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Open proof error:", error);

      setDialogMessage("Unable to open the expense proof.");
      setDialog("error");
    }
  }

  if (items.length === 0) {
    return (
      <div>
        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            No approved expenses are waiting for reimbursement.
          </p>
        </div>

        <AppDialog
          open={dialog !== null}
          title={dialog === "error" ? "Unable to Continue" : "Confirm Action"}
          description={dialogMessage}
          variant={dialog === "error" ? "danger" : "danger"}
          confirmLabel="OK"
          cancelLabel={dialog === "error" ? undefined : "Cancel"}
          onCancel={closeDialog}
          onConfirm={() => {
            if (dialog === "error") {
              closeDialog();
            }
          }}
        />
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
          <table className="w-full min-w-[1000px] text-left text-sm">
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
                  <tr key={expense.id} className="transition hover:bg-slate-50">
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
                      {formatCurrency(Number(expense.amount), expense.currency)}
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
                        onClick={() => {
                          setSelectedExpense(expense);
                          setRejectionReason("");
                          setMessage("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Eye size={15} />
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}

      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Review Reimbursement
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review the expense details and supporting proof before making
                  a reimbursement decision.
                </p>
              </div>

              <button
                type="button"
                disabled={processingId === selectedExpense.id}
                onClick={closeReview}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Employee Information */}

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <User size={18} className="text-slate-600" />

                  <h3 className="font-semibold text-slate-900">
                    Employee Information
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedExpense.user?.name ?? "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {selectedExpense.user?.email ?? "-"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Expense Information */}

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ReceiptText size={18} className="text-slate-600" />

                  <h3 className="font-semibold text-slate-900">
                    Expense Details
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Expense
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedExpense.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Category
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {selectedExpense.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Amount
                    </p>

                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(
                        Number(selectedExpense.amount),
                        selectedExpense.currency,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Expense Date
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {selectedExpense.expenseDate
                        ? new Date(
                            selectedExpense.expenseDate,
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>

                  {selectedExpense.vendor && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Vendor
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedExpense.vendor}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Approval Information */}

              <section className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />

                  <h3 className="font-semibold text-green-900">
                    Expense Approval
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                      Expense Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-green-800">
                      {selectedExpense.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                      Approved By
                    </p>

                    <p className="mt-1 text-sm text-green-800">
                      {selectedExpense.decidedBy?.name ?? "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                      Approved On
                    </p>

                    <p className="mt-1 text-sm text-green-800">
                      {selectedExpense.decidedAt
                        ? new Date(
                            selectedExpense.decidedAt,
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Proof */}

              <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />

                  <h3 className="font-semibold text-blue-900">
                    Supporting Proof
                  </h3>
                </div>

                <p className="mb-4 text-sm text-blue-700">
                  Review the attached receipt or bill proof before making the
                  reimbursement decision.
                </p>

                <div className="flex flex-wrap gap-3">
                  {selectedExpense.ocrReceiptUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        openProof(selectedExpense.id, "ocr-receipt")
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      <Eye size={16} />
                      View Original Receipt
                    </button>
                  )}

                  {selectedExpense.billProofUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        openProof(selectedExpense.id, "bill-proof")
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
                    >
                      <Eye size={16} />
                      View Bill Proof
                    </button>
                  )}

                  {!selectedExpense.ocrReceiptUrl &&
                    !selectedExpense.billProofUrl && (
                      <p className="text-sm text-blue-700">
                        No supporting proof is attached to this expense.
                      </p>
                    )}
                </div>
              </section>

              {/* Rejection Reason */}

              <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <XCircle size={18} className="text-red-600" />

                  <h3 className="font-semibold text-red-900">
                    Reject Reimbursement
                  </h3>
                </div>

                <p className="mb-3 text-sm text-red-700">
                  A reason is required when rejecting reimbursement.
                </p>

                <textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Enter the reason for rejecting this reimbursement..."
                  rows={4}
                  className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  disabled={processingId === selectedExpense.id}
                />
              </section>

              {message && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              )}

              {/* Actions */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={processingId === selectedExpense.id}
                  onClick={closeReview}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={processingId === selectedExpense.id}
                  onClick={() => requestReject(selectedExpense.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={16} />

                  {processingId === selectedExpense.id
                    ? "Processing..."
                    : "Reject Reimbursement"}
                </button>

                <button
                  type="button"
                  disabled={processingId === selectedExpense.id}
                  onClick={() => requestReimburse(selectedExpense.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />

                  {processingId === selectedExpense.id
                    ? "Processing..."
                    : "Reimburse Expense"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AppDialog
        open={dialog !== null}
        title={
          dialog === "reimburse"
            ? "Confirm Reimbursement"
            : dialog === "reject"
              ? "Confirm Rejection"
              : "Unable to Continue"
        }
        description={dialogMessage}
        variant={dialog === "reimburse" ? "default" : "danger"}
        confirmLabel={
          dialog === "reimburse"
            ? "Reimburse"
            : dialog === "reject"
              ? "Reject"
              : "OK"
        }
        cancelLabel={dialog === "error" ? undefined : "Cancel"}
        loading={processingId !== null}
        loadingLabel="Processing..."
        onCancel={closeDialog}
        onConfirm={() => {
          if (dialog === "reimburse") {
            void handleReimburse();
            return;
          }

          if (dialog === "reject") {
            void handleReject();
            return;
          }

          closeDialog();
        }}
      />
    </div>
  );
}
