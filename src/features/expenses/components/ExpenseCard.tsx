"use client";

import { useUser } from "@/context/UserContext";

import {
  Calendar,
  Clock,
  Tag,
  Pencil,
  Trash2,
  ReceiptText,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Banknote,
  ShieldAlert,
} from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate, formatTime } from "@/utils/formatDate";
import { getCategoryColor } from "@/utils/categoryColor";

import type { DisplayExpense } from "../types";

import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

import ReceiptUpload from "./ReceiptUpload";

type ExpenseCardProps = {
  expense: DisplayExpense;
  onEdit: (expense: DisplayExpense) => void;
};

export default function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  const { defaultCurrency } = useUser();

  /*
   * displayAmount has already been calculated on the server
   * using the user's CURRENT default currency.
   *
   * The original amount/currency remain untouched.
   */
  const displayAmount = expense.displayAmount;

  const canModify = expense.status === "PENDING";

  const hasOcrReceipt = Boolean(expense.ocrReceiptUrl);
  const hasBillProof = Boolean(expense.billProofUrl);
  const hasProof = hasOcrReceipt || hasBillProof;

  const isApproved = expense.status === "APPROVED";
  const isRejected = expense.status === "REJECTED";
  const isReimbursed = expense.reimbursementStatus === "REIMBURSED";
  const isReimbursementRejected = expense.reimbursementStatus === "REJECTED";
  const isPending = expense.status === "PENDING";

  const hasAdminModification = Boolean(expense.adminModification);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "Unable to delete expense.");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Delete expense error:", error);
      alert("Unable to delete expense.");
    }
  }

  return (
    <Card className="flex min-h-60 flex-col text-black">
      {/* Expense information */}
      <div className="space-y-2">
        <h2 className="mb-3 break-words text-3xl font-semibold">
          {expense.title}
        </h2>

        <div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-green-600">
              {formatCurrency(displayAmount, defaultCurrency)}
            </p>

            {expense.currency !== defaultCurrency && (
              <p className="mt-1 text-sm text-gray-500">
                ({formatCurrency(expense.amount, expense.currency)})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category */}
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(
          expense.category,
        )}`}
      >
        <Tag size={16} />
        <span>{expense.category}</span>
      </div>

      {/* Date and time */}
      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(expense.expenseDate ?? expense.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{formatTime(expense.expenseDate ?? expense.createdAt)}</span>
        </div>
      </div>

      {/* Admin Modification Notice */}
      {hasAdminModification && expense.adminModification && (
        <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert
              size={19}
              className="mt-0.5 shrink-0 text-purple-600"
            />

            <div className="min-w-0">
              <p className="font-semibold text-purple-900">
                Expense Modified by Admin
              </p>

              <p className="mt-1 text-sm text-purple-700">
                This expense was updated by{" "}
                <span className="font-medium">
                  {expense.adminModification.admin.name}
                </span>
                .
              </p>

              <p className="mt-1 text-xs text-purple-600">
                Modified on {formatDate(expense.adminModification.modifiedAt)}
              </p>
            </div>
          </div>

          {Object.keys(expense.adminModification.changes).length > 0 && (
            <div className="mt-4 border-t border-purple-200 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-800">
                Changes made
              </p>

              <div className="space-y-2">
                {Object.entries(expense.adminModification.changes).map(
                  ([field, change]) => (
                    <div
                      key={field}
                      className="rounded-md bg-white/70 px-3 py-2 text-sm"
                    >
                      <p className="font-medium capitalize text-purple-900">
                        {field}
                      </p>

                      <p className="mt-1 text-purple-700">
                        <span className="line-through">
                          {change.from ?? "—"}
                        </span>

                        {" → "}

                        <span className="font-semibold">
                          {change.to ?? "—"}
                        </span>
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approval Status */}
      <div className="mt-4">
        {isPending && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Clock size={18} className="text-amber-600" />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                Approval Status
              </p>

              <p className="text-sm text-amber-700">Pending</p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />

              <div>
                <p className="text-sm font-semibold text-green-800">
                  Approval Status
                </p>

                <p className="text-sm text-green-700">Approved</p>
              </div>
            </div>

            {expense.decidedBy && (
              <div className="mt-3 border-t border-green-200 pt-3 text-sm text-green-700">
                <p>
                  <span className="font-medium">Approved by:</span>{" "}
                  {expense.decidedBy.name}
                </p>

                {expense.decidedAt && (
                  <p className="mt-1">
                    <span className="font-medium">Approved on:</span>{" "}
                    {formatDate(expense.decidedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {isRejected && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <XCircle size={18} className="text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Approval Status
                </p>

                <p className="text-sm text-red-700">Rejected</p>
              </div>
            </div>

            {expense.decidedBy && (
              <div className="mt-3 border-t border-red-200 pt-3 text-sm text-red-700">
                <p>
                  <span className="font-medium">Rejected by:</span>{" "}
                  {expense.decidedBy.name}
                </p>

                {expense.decidedAt && (
                  <p className="mt-1">
                    <span className="font-medium">Rejected on:</span>{" "}
                    {formatDate(expense.decidedAt)}
                  </p>
                )}
              </div>
            )}

            {expense.rejectionReason && (
              <div className="mt-3 border-t border-red-200 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                  Rejection Reason
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {expense.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}

        {isReimbursed && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />

              <div>
                <p className="text-sm font-semibold text-green-800">
                  Approval Status
                </p>

                <p className="text-sm text-green-700">Approved</p>
              </div>
            </div>

            {expense.decidedBy && (
              <div className="mt-3 border-t border-green-200 pt-3 text-sm text-green-700">
                <p>
                  <span className="font-medium">Approved by:</span>{" "}
                  {expense.decidedBy.name}
                </p>

                {expense.decidedAt && (
                  <p className="mt-1">
                    <span className="font-medium">Approved on:</span>{" "}
                    {formatDate(expense.decidedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reimbursement Status */}
      {isApproved || isReimbursed ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-blue-600" />

            <div>
              <p className="text-sm font-semibold text-blue-800">
                Reimbursement Status
              </p>

              <p className="text-sm text-blue-700">
                {isReimbursed
                  ? "Reimbursed"
                  : isReimbursementRejected
                    ? "Reimbursement Rejected"
                    : "Pending Reimbursement"}
              </p>
            </div>
          </div>

          {isReimbursed && expense.reimbursementBy && (
            <div className="mt-3 border-t border-blue-200 pt-3 text-sm text-blue-700">
              <p>
                <span className="font-medium">Reimbursed by:</span>{" "}
                {expense.reimbursementBy.name}
              </p>

              {expense.reimbursementAt && (
                <p className="mt-1">
                  <span className="font-medium">Reimbursed on:</span>{" "}
                  {formatDate(expense.reimbursementAt)}
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Original OCR receipt */}
      {hasOcrReceipt && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />

            <span className="font-medium text-blue-800">Original Receipt</span>
          </div>

          <p className="mt-1 text-sm text-blue-700">
            Original receipt used for OCR extraction.
          </p>

          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={async () => {
                const response = await fetch(
                  `/api/expenses/${expense.id}/ocr-receipt`,
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.error ?? "Unable to open original receipt.");
                  return;
                }

                window.open(data.url, "_blank");
              }}
            >
              <Eye size={16} />
              View Original Receipt
            </Button>
          </div>
        </div>
      )}

      {/* Proof section */}
      {hasProof && !hasOcrReceipt ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <ReceiptText size={18} className="text-green-600" />

            <span className="font-medium text-green-800">
              Bill Proof Uploaded
            </span>
          </div>

          <p className="mt-1 text-sm text-green-700">
            This proof is permanently attached to this expense.
          </p>

          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={async () => {
                const response = await fetch(
                  `/api/expenses/${expense.id}/bill-proof`,
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.error ?? "Unable to open bill proof.");
                  return;
                }

                window.open(data.url, "_blank");
              }}
            >
              <Eye size={16} />
              View Bill Proof
            </Button>
          </div>
        </div>
      ) : hasOcrReceipt ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />

            <span className="font-medium text-blue-800">
              Expense Proof Attached
            </span>
          </div>

          <p className="mt-1 text-sm text-blue-700">
            The original receipt is being used as the expense proof.
          </p>
        </div>
      ) : isPending ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />

            <span className="font-medium text-amber-800">Proof Required</span>
          </div>

          <p className="mt-1 text-sm text-amber-700">
            Upload a receipt, invoice, or bill proof before submitting this
            expense for approval.
          </p>

          <ReceiptUpload expenseId={expense.id} />
        </div>
      ) : null}

      <hr className="my-5 border-gray-200" />

      {/* Expense actions */}
      <div className="grid grid-cols-2 gap-3">
        {canModify && (
          <Button
            type="button"
            className="flex w-full items-center justify-center gap-2"
            onClick={() => onEdit(expense)}
          >
            <Pencil size={18} />
            Edit
          </Button>
        )}

        {canModify && (
          <Button
            type="button"
            variant="danger"
            className="flex w-full items-center justify-center gap-2"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
