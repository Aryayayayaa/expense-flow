"use client";

import { useRouter } from "next/navigation";

import {
  ApprovalStatusFilter,
  ReimbursementStatusFilter,
  type ExpenseApprovalStatus,
  type ExpenseReimbursementStatus,
} from "@/features/expenses/components/StatusFilters";

type ApprovalStatusFiltersProps = {
  approvalStatus: ExpenseApprovalStatus;
  reimbursementStatus: ExpenseReimbursementStatus;
};

export default function ApprovalStatusFilters({
  approvalStatus,
  reimbursementStatus,
}: ApprovalStatusFiltersProps) {
  const router = useRouter();

  function updateFilters(
    nextApprovalStatus: ExpenseApprovalStatus,
    nextReimbursementStatus: ExpenseReimbursementStatus,
  ) {
    const params = new URLSearchParams();

    if (nextApprovalStatus !== "ALL") {
      params.set("approvalStatus", nextApprovalStatus);
    }

    if (nextReimbursementStatus !== "ALL") {
      params.set("reimbursementStatus", nextReimbursementStatus);
    }

    const queryString = params.toString();

    router.push(queryString ? `/approvals?${queryString}` : "/approvals");
  }

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Filter Approvals
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Filter approval history and pending expenses by status.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <ApprovalStatusFilter
          value={approvalStatus}
          onChange={(value) => updateFilters(value, reimbursementStatus)}
        />

        <ReimbursementStatusFilter
          value={reimbursementStatus}
          onChange={(value) => updateFilters(approvalStatus, value)}
        />
      </div>
    </div>
  );
}
