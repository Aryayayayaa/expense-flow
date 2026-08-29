"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilters(
    nextApprovalStatus: ExpenseApprovalStatus,
    nextReimbursementStatus: ExpenseReimbursementStatus,
  ) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");

    if (nextApprovalStatus === "ALL") {
      params.delete("approvalStatus");
    } else {
      params.set("approvalStatus", nextApprovalStatus);
    }

    if (nextReimbursementStatus === "ALL") {
      params.delete("reimbursementStatus");
    } else {
      params.set("reimbursementStatus", nextReimbursementStatus);
    }

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
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
