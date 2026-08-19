"use client";

export type ExpenseApprovalStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export type ExpenseReimbursementStatus =
  | "ALL"
  | "PENDING"
  | "REIMBURSED"
  | "REJECTED";

type StatusFiltersProps = {
  approvalStatus: ExpenseApprovalStatus;
  reimbursementStatus: ExpenseReimbursementStatus;
  onApprovalStatusChange: (value: ExpenseApprovalStatus) => void;
  onReimbursementStatusChange: (value: ExpenseReimbursementStatus) => void;
};

export default function StatusFilters({
  approvalStatus,
  reimbursementStatus,
  onApprovalStatusChange,
  onReimbursementStatusChange,
}: StatusFiltersProps) {
  return (
    <>
      <div className="flex min-w-[180px] flex-col gap-1">
        <select
          id="expense-approval-status-filter"
          value={approvalStatus}
          onChange={(event) =>
            onApprovalStatusChange(event.target.value as ExpenseApprovalStatus)
          }
          className="h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="ALL">All Approval Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="flex min-w-[180px] flex-col gap-1">
        <select
          id="expense-reimbursement-status-filter"
          value={reimbursementStatus}
          onChange={(event) =>
            onReimbursementStatusChange(
              event.target.value as ExpenseReimbursementStatus,
            )
          }
          className="h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="ALL">All Reimbursement Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="REIMBURSED">Reimbursed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
    </>
  );
}
