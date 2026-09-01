"use client";

export type ExpenseApprovalStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export type ExpenseReimbursementStatus =
  | "ALL"
  | "PENDING"
  | "REIMBURSED"
  | "REJECTED";

type ApprovalStatusFilterProps = {
  value: ExpenseApprovalStatus;
  onChange: (value: ExpenseApprovalStatus) => void;
};

type ReimbursementStatusFilterProps = {
  value: ExpenseReimbursementStatus;
  onChange: (value: ExpenseReimbursementStatus) => void;
};

const selectClassName =
  "h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900";

export function ApprovalStatusFilter({
  value,
  onChange,
}: ApprovalStatusFilterProps) {
  return (
    <div className="min-w-0 w-full">
      <select
        id="expense-approval-status-filter"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as ExpenseApprovalStatus)
        }
        className={selectClassName}
      >
        <option value="ALL">All Approval Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>
  );
}

export function ReimbursementStatusFilter({
  value,
  onChange,
}: ReimbursementStatusFilterProps) {
  return (
    <div className="min-w-0 w-full dark:bg-slate-800">
      <select
        id="expense-reimbursement-status-filter"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as ExpenseReimbursementStatus)
        }
        className={selectClassName}
      >
        <option value="ALL">All Reimbursement Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="REIMBURSED">Reimbursed</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>
  );
}
