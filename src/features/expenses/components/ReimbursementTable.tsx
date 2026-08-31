"use client";

import { useEffect, useState } from "react";

import {
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

import type { Role } from "@prisma/client";

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
  userId: number;
  userRole: Role;
};

type DialogType = "reimburse" | "reject" | "error" | null;

export default function ReimbursementTable({
  expenses,
  userId,
  userRole,
}: Props) {
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

  function isApprovedByCurrentAdmin(expense: ReimbursementExpense) {
    return userRole === "ADMIN" && expense.decidedBy?.id === userId;
  }

  function requestReimburse() {
    if (processingId !== null || !selectedExpense) {
      return;
    }

    if (isApprovedByCurrentAdmin(selectedExpense)) {
      setDialogMessage(
        "You approved this expense, so you cannot reimburse it. Another Admin or an HR member must process the reimbursement.",
      );
      setDialog("error");
      return;
    }

    setDialogMessage("Are you sure you want to reimburse this expense?");
    setDialog("reimburse");
  }

  function requestReject() {
    if (processingId !== null || !selectedExpense) {
      return;
    }

    if (isApprovedByCurrentAdmin(selectedExpense)) {
      setDialogMessage(
        "You approved this expense, so you cannot reject its reimbursement. Another Admin or an HR member must process the reimbursement.",
      );
      setDialog("error");
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

    setDialogMessage(
      "Are you sure you want to reject reimbursement for this expense?",
    );
    setDialog("reject");
  }

  async function handleReimburse() {
    if (!selectedExpense || processingId !== null) {
      return;
    }

    if (isApprovedByCurrentAdmin(selectedExpense)) {
      setDialogMessage(
        "You approved this expense, so you cannot reimburse it. Another Admin or an HR member must process the reimbursement.",
      );
      setDialog("error");
      return;
    }

    const id = selectedExpense.id;

    setProcessingId(id);
    setDialogMessage("Reimbursement is in progress...");
    setMessage("");

    try {
      const result = await reimburseExpenseAction(id);

      setMessage(result.message);

      if (result.success) {
        setItems((current) => current.filter((expense) => expense.id !== id));

        setSelectedExpense(null);
        setRejectionReason("");
        setDialog(null);
        setDialogMessage("");
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

    if (isApprovedByCurrentAdmin(selectedExpense)) {
      setDialogMessage(
        "You approved this expense, so you cannot reject its reimbursement. Another Admin or an HR member must process the reimbursement.",
      );
      setDialog("error");
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

    setProcessingId(id);
    setDialogMessage("Reimbursement rejection is in progress...");
    setMessage("");

    try {
      const result = await rejectReimbursementAction(id, reason);

      setMessage(result.message);

      if (result.success) {
        setItems((current) => current.filter((expense) => expense.id !== id));

        setSelectedExpense(null);
        setRejectionReason("");
        setDialog(null);
        setDialogMessage("");
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

  async function openProof(expenseId: number) {
    if (processingId !== null) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${expenseId}/ocr-receipt`);

      const data = await response.json();

      if (!response.ok) {
        setDialogMessage(data.error ?? "Unable to open the original receipt.");
        setDialog("error");
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Open receipt error:", error);

      setDialogMessage("Unable to open the original receipt.");
      setDialog("error");
    }
  }

  if (items.length === 0) {
    return (
      <div>
        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            No approved expenses are waiting for reimbursement.
          </p>
        </div>

        <AppDialog
          open={dialog !== null}
          title={dialog === "error" ? "Unable to Continue" : "Confirm Action"}
          description={dialogMessage}
          variant="danger"
          confirmLabel="OK"
          cancelLabel={dialog === "error" ? undefined : "Cancel"}
          loading={processingId !== null}
          loadingLabel="Processing..."
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
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
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
                  Approved By
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  Approved On
                </th>

                <th className="px-5 py-4 text-right font-medium text-slate-500 dark:text-slate-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((expense) => {
                const processing = processingId === expense.id;

                const approvedByCurrentAdmin =
                  isApprovedByCurrentAdmin(expense);

                return (
                  <tr
                    key={expense.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {expense.user?.name ?? "Unknown employee"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {expense.user?.email ?? ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {expense.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {expense.category}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(Number(expense.amount), expense.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className={
                          approvedByCurrentAdmin
                            ? "font-medium text-blue-700"
                            : "text-slate-600 dark:text-slate-300"
                        }
                      >
                        {approvedByCurrentAdmin
                          ? "You"
                          : (expense.decidedBy?.name ?? "Unknown")}
                      </p>

                      {approvedByCurrentAdmin && (
                        <p className="mt-1 text-xs text-blue-600">
                          Approved by you
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
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
                        disabled={processing || processingId !== null}
                        onClick={() => {
                          setSelectedExpense(expense);
                          setRejectionReason("");
                          setMessage("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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

      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Review Reimbursement
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review the expense details and supporting receipt before
                  making a reimbursement decision.
                </p>
              </div>

              <button
                type="button"
                disabled={processingId === selectedExpense.id}
                onClick={closeReview}
                className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex items-center gap-2">
                  <User
                    size={18}
                    className="text-slate-600 dark:text-slate-300"
                  />

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Employee Information
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedExpense.user?.name ?? "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {selectedExpense.user?.email ?? "-"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-2">
                  <ReceiptText
                    size={18}
                    className="text-slate-600 dark:text-slate-300"
                  />

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Expense Details
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Expense
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedExpense.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {selectedExpense.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Expense Date
                    </p>

                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
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
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Vendor
                      </p>

                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {selectedExpense.vendor}
                      </p>
                    </div>
                  )}
                </div>
              </section>

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
                      {isApprovedByCurrentAdmin(selectedExpense)
                        ? "You"
                        : (selectedExpense.decidedBy?.name ?? "Unknown")}
                    </p>

                    {isApprovedByCurrentAdmin(selectedExpense) && (
                      <p className="mt-1 text-xs font-medium text-blue-700">
                        You approved this expense.
                      </p>
                    )}
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

              {isApprovedByCurrentAdmin(selectedExpense) && (
                <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Approved by you
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-blue-700">
                        You approved this expense, so you cannot reimburse or
                        reject its reimbursement. Another Admin or an HR member
                        must process the reimbursement.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />

                  <h3 className="font-semibold text-blue-900">
                    Supporting Receipt
                  </h3>
                </div>

                <p className="mb-4 text-sm text-blue-700">
                  Review the attached original receipt before making the
                  reimbursement decision.
                </p>

                <div className="flex flex-wrap gap-3">
                  {selectedExpense.ocrReceiptUrl ? (
                    <button
                      type="button"
                      disabled={processingId !== null}
                      onClick={() => openProof(selectedExpense.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Eye size={16} />
                      View Original Receipt
                    </button>
                  ) : (
                    <p className="text-sm text-blue-700">
                      No original receipt is attached to this expense.
                    </p>
                  )}
                </div>
              </section>

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
                  className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-red-900/60 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-800"
                  disabled={processingId === selectedExpense.id}
                />
              </section>

              {message && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                  {message}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={processingId !== null}
                  onClick={closeReview}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    processingId !== null ||
                    isApprovedByCurrentAdmin(selectedExpense)
                  }
                  onClick={requestReject}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={16} />

                  {processingId === selectedExpense.id
                    ? "Processing..."
                    : isApprovedByCurrentAdmin(selectedExpense)
                      ? "Approved by you"
                      : "Reject Reimbursement"}
                </button>

                <button
                  type="button"
                  disabled={
                    processingId !== null ||
                    isApprovedByCurrentAdmin(selectedExpense)
                  }
                  onClick={requestReimburse}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />

                  {processingId === selectedExpense.id
                    ? "Processing..."
                    : isApprovedByCurrentAdmin(selectedExpense)
                      ? "Approved by you"
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
        loadingLabel={
          dialog === "reimburse"
            ? "Reimbursing..."
            : dialog === "reject"
              ? "Rejecting..."
              : "Processing..."
        }
        onCancel={closeDialog}
        onConfirm={() => {
          if (processingId !== null) {
            return;
          }

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
