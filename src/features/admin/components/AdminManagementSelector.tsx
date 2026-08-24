"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import UserManagementTable from "./UserManagementTable";

import ReimbursementTable, {
  ReimbursementExpense,
} from "@/features/expenses/components/ReimbursementTable";
import ReimbursementHistoryTable from "@/features/expenses/components/ReimbursementHistoryTable";
import ReimbursementScopeSelector from "@/features/expenses/components/ReimbursementScopeSelector";

import type {
  ReimbursementExpenseScope,
  ReimbursementHistoryExpense,
} from "@/features/expenses/lib/expenses";

import Pagination from "@/components/common/Pagination";

import EmployeeVerificationRequest from "@/features/auth/components/EmployeeVerificationRequest";
import EmployeeVerificationTable from "@/features/auth/components/EmployeeVerificationTable";
import EmployeeVerificationHistoryTable from "@/features/auth/components/EmployeeVerificationHistoryTable";

import NameChangeRequest from "@/features/auth/components/NameChangeRequest";
import NameChangeRequestTable from "@/features/auth/components/NameChangeRequestTable";
import NameChangeRequestHistoryTable from "@/features/auth/components/NameChangeRequestHistoryTable";

import RoleVerificationTable from "@/features/auth/components/RoleVerificationTable";
import RoleVerificationHistoryTable from "@/features/auth/components/RoleVerificationHistoryTable";

import type {
  EmployeeVerificationStatus,
  NameChangeRequestStatus,
  Role,
  RoleRequestStatus,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

type EmployeeVerificationRequest = {
  id: number;
  proofUrl: string | null;
  proofPath: string | null;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type EmployeeVerificationHistoryRequest = {
  id: number;
  status: EmployeeVerificationStatus;
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  reviewedBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;
};

type NameChangeRequest = {
  id: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl: string | null;
  proofPath: string | null;
  status: NameChangeRequestStatus;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type NameChangeRequestHistoryRequest = {
  id: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl: string | null;
  proofPath: string | null;
  status: NameChangeRequestStatus;
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  reviewedBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;
};

type RoleVerificationRequest = {
  id: number;
  requestedRole: Role;
  status: RoleRequestStatus;
  createdAt: Date;
  proofUrl: string | null;
  proofPath: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type RoleVerificationHistoryRequest = {
  id: number;
  requestedRole: Role;
  status: RoleRequestStatus;
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  reviewedBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;
};

type OwnIdentityRequest = {
  id: number;
  proofUrl: string | null;
  proofPath: string | null;
  status: EmployeeVerificationStatus;
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  reviewedBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;
};

type OwnNameChangeRequest = {
  id: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl: string | null;
  proofPath: string | null;
  status: NameChangeRequestStatus;
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  reviewedBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;
};

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

type Props = {
  userName: string;
  users: User[];

  /* Reimbursements */
  approvedExpenses: ReimbursementExpense[];
  reimbursementExpenses: ReimbursementHistoryExpense[];
  reimbursementScope: ReimbursementExpenseScope;

  reimbursementPage: number;
  reimbursementTotalPages: number;

  reimbursementHistoryPage: number;
  reimbursementHistoryTotalPages: number;

  /* Employee Verification */
  employeeVerificationRequests: EmployeeVerificationRequest[];
  employeeVerificationHistory: EmployeeVerificationHistoryRequest[];

  ownIdentityRequests: OwnIdentityRequest[];
  latestOwnIdentityRequest: OwnIdentityRequest | null;
  ownIdentityAttemptCount: number;

  /* Name Change */
  nameChangeRequests: NameChangeRequest[];
  nameChangeRequestHistory: NameChangeRequestHistoryRequest[];

  ownNameChangeRequests: OwnNameChangeRequest[];

  /* Role Verification */
  roleRequests: RoleVerificationRequest[];
  roleRequestHistory: RoleVerificationHistoryRequest[];
};

/* -------------------------------------------------------------------------- */
/* Management View                                                            */
/* -------------------------------------------------------------------------- */

type ManagementView =
  | "users"
  | "employee-verification"
  | "name-change"
  | "role-verification"
  | "reimbursements";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminManagementSelector({
  userName,
  users,

  approvedExpenses,
  reimbursementExpenses,
  reimbursementScope,

  reimbursementPage,
  reimbursementTotalPages,

  reimbursementHistoryPage,
  reimbursementHistoryTotalPages,

  employeeVerificationRequests,
  employeeVerificationHistory,

  ownIdentityRequests,
  latestOwnIdentityRequest,
  ownIdentityAttemptCount,

  nameChangeRequests,
  nameChangeRequestHistory,
  ownNameChangeRequests,

  roleRequests,
  roleRequestHistory,
}: Props) {
  const [view, setView] = useState<ManagementView>("users");

  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------------------------------------------------------------------- */
  /* Change reimbursement scope                                              */
  /* ---------------------------------------------------------------------- */

  function handleReimbursementScopeChange(scope: ReimbursementExpenseScope) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("reimbursementScope", scope);

    /*
     * Reset both reimbursement paginations whenever
     * the expense scope changes.
     */
    params.set("reimbursementPage", "1");
    params.set("reimbursementHistoryPage", "1");

    router.push(`/admin?${params.toString()}`);
  }

  /* ---------------------------------------------------------------------- */
  /* View                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="mt-8">
      {/* ------------------------------------------------------------------ */}
      {/* Administration Selector                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label
          htmlFor="admin-management-view"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Administration
        </label>

        <select
          id="admin-management-view"
          value={view}
          onChange={(event) => setView(event.target.value as ManagementView)}
          className="h-12 w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="users">Users</option>

          <option value="employee-verification">Employee Verification</option>

          <option value="name-change">Name Change Requests</option>

          <option value="role-verification">Role Verification Requests</option>

          <option value="reimbursements">Reimbursements</option>
        </select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Users                                                                */}
      {/* ------------------------------------------------------------------ */}

      {view === "users" && (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View all registered users and manage account status.
            </p>
          </div>

          <UserManagementTable users={users} />
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Employee Verification                                               */}
      {/* ------------------------------------------------------------------ */}

      {view === "employee-verification" && (
        <>
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Identity Verification
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Submit your own identity verification request. Another HR or
                Admin account must review it.
              </p>
            </div>

            <EmployeeVerificationRequest
              requestId={latestOwnIdentityRequest?.id}
              status={latestOwnIdentityRequest?.status ?? "NOT_SUBMITTED"}
              rejectionReason={latestOwnIdentityRequest?.rejectionReason}
              attemptCount={ownIdentityAttemptCount}
            />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                My Identity Verification History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your previously submitted verification requests.
              </p>
            </div>

            <EmployeeVerificationHistoryTable requests={ownIdentityRequests} />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Employee Verification Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review identity and employment verification requests from other
                users.
              </p>
            </div>

            <EmployeeVerificationTable
              requests={employeeVerificationRequests}
            />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Employee Verification History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review previously approved and rejected verification requests.
              </p>
            </div>

            <EmployeeVerificationHistoryTable
              requests={employeeVerificationHistory}
            />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Name Change                                                          */}
      {/* ------------------------------------------------------------------ */}

      {view === "name-change" && (
        <>
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Request Name Change
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Submit your own name change request. Another HR or Admin account
                must review it.
              </p>
            </div>

            <NameChangeRequest currentName={userName} />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                My Name Change History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your previously submitted name change requests.
              </p>
            </div>

            <NameChangeRequestHistoryTable requests={ownNameChangeRequests} />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Pending Name Change Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review name change requests submitted by other users.
              </p>
            </div>

            <NameChangeRequestTable requests={nameChangeRequests} />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Name Change Request History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review previously approved and rejected name change requests.
              </p>
            </div>

            <NameChangeRequestHistoryTable
              requests={nameChangeRequestHistory}
            />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Role Verification                                                   */}
      {/* ------------------------------------------------------------------ */}

      {view === "role-verification" && (
        <>
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Role Verification Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review employee requests for ADMIN or HR privileges.
              </p>
            </div>

            <RoleVerificationTable requests={roleRequests} canReview={true} />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Role Verification History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review previously approved and rejected role verification
                requests.
              </p>
            </div>

            <RoleVerificationHistoryTable requests={roleRequestHistory} />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Reimbursements                                                       */}
      {/* ------------------------------------------------------------------ */}

      {view === "reimbursements" && (
        <>
          {/* -------------------------------------------------------------- */}
          {/* Expense Scope                                                   */}
          {/* -------------------------------------------------------------- */}

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Reimbursements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review pending reimbursement requests and reimbursement history
                based on the selected expense scope.
              </p>
            </div>

            <ReimbursementScopeSelector
              scope={reimbursementScope}
              basePath="/admin"
            />
          </section>

          {/* -------------------------------------------------------------- */}
          {/* Pending Reimbursement Approvals                                */}
          {/* -------------------------------------------------------------- */}

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Pending Reimbursement Approvals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review approved expenses that are waiting to be reimbursed. You
                can review the expense proof and approve or reject the
                reimbursement.
              </p>
            </div>

            <ReimbursementTable expenses={approvedExpenses} />

            <Pagination
              page={reimbursementPage}
              totalPages={reimbursementTotalPages}
              paramName="reimbursementPage"
            />
          </section>

          {/* -------------------------------------------------------------- */}
          {/* Reimbursement History                                            */}
          {/* -------------------------------------------------------------- */}

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Reimbursement History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review reimbursements that have already been processed,
                including approval and processing details.
              </p>
            </div>

            <ReimbursementHistoryTable expenses={reimbursementExpenses} />

            <Pagination
              page={reimbursementHistoryPage}
              totalPages={reimbursementHistoryTotalPages}
              paramName="reimbursementHistoryPage"
            />
          </section>
        </>
      )}
    </div>
  );
}
