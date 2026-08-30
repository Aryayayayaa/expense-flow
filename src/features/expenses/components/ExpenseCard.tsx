"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

import {
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  Banknote,
  ShieldAlert,
  ReceiptText,
} from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate, formatTime } from "@/utils/formatDate";
import { getCategoryColor } from "@/utils/categoryColor";

import type { DisplayExpense } from "../types";

import Card from "@/components/common/Card";

type ExpenseCardProps = {
  expense: DisplayExpense;
  onEdit: (expense: DisplayExpense) => void;
};

export default function ExpenseCard({ expense }: ExpenseCardProps) {
  const router = useRouter();
  const { defaultCurrency } = useUser();

  const displayAmount = expense.displayAmount;

  const isApproved = expense.status === "APPROVED";
  const isRejected = expense.status === "REJECTED";
  const isPending = expense.status === "PENDING";

  const isReimbursed = expense.reimbursementStatus === "REIMBURSED";
  const isReimbursementRejected = expense.reimbursementStatus === "REJECTED";

  const hasAdminModification = Boolean(expense.adminModification);
  const hasReceipt = Boolean(expense.ocrReceiptUrl);

  function handleOpenExpense() {
    router.push(`/expenses/${expense.id}`);
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleOpenExpense}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenExpense();
        }
      }}
      className="h-full cursor-pointer rounded-xl transition hover:-translate-y-1 hover:shadow-lg"
    >
      <Card className="flex h-full flex-col overflow-hidden text-black dark:text-white dark:bg-slate-900">
        {/* Expense information */}
        <div className="space-y-2">
          {/* Fixed title area */}
          <h2 className="mb-3 line-clamp-2 min-h-[72px] break-words text-3xl font-semibold">
            {expense.title}
          </h2>

          {/* Amount */}
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
          <div className="mt-4 max-h-[180px] overflow-hidden rounded-lg border border-purple-200 bg-purple-50 p-4">
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

                <div className="max-h-[80px] space-y-2 overflow-hidden">
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
        </div>

        {/* Reimbursement Status */}
        {!isRejected && (
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
        )}

        {/* Receipt */}
        {hasReceipt && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <ReceiptText size={16} />
            <span>Receipt attached</span>
          </div>
        )}

        {/* Click hint */}
        <div className="mt-auto pt-5 text-sm font-medium text-blue-600">
          View expense details →
        </div>
      </Card>
    </div>
  );
}
