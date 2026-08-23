"use client";

import { useState } from "react";

import UserManagementTable from "./UserManagementTable";
import ReimbursementHistoryTable from "@/features/expenses/components/ReimbursementHistoryTable";

import EmployeeVerificationTable from "@/features/auth/components/EmployeeVerificationTable";
import EmployeeVerificationHistoryTable from "@/features/auth/components/EmployeeVerificationHistoryTable";

import NameChangeRequestTable from "@/features/auth/components/NameChangeRequestTable";
import NameChangeRequestHistoryTable from "@/features/auth/components/NameChangeRequestHistoryTable";

import RoleVerificationTable from "@/features/auth/components/RoleVerificationTable";
import RoleVerificationHistoryTable from "@/features/auth/components/RoleVerificationHistoryTable";

import type { ReimbursementHistoryExpense } from "@/features/expenses/lib/expenses";
import type {
  EmployeeVerificationStatus,
  NameChangeRequestStatus,
  Role,
  RoleRequestStatus,
} from "@prisma/client";

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

type Props = {
  users: User[];
  reimbursementExpenses: ReimbursementHistoryExpense[];

  employeeVerificationRequests: EmployeeVerificationRequest[];
  employeeVerificationHistory: EmployeeVerificationHistoryRequest[];

  nameChangeRequests: NameChangeRequest[];
  nameChangeRequestHistory: NameChangeRequestHistoryRequest[];

  roleRequests: RoleVerificationRequest[];
  roleRequestHistory: RoleVerificationHistoryRequest[];
};

type ManagementView =
  | "users"
  | "employee-verification"
  | "name-change"
  | "role-verification"
  | "reimbursements";

export default function AdminManagementSelector({
  users,
  reimbursementExpenses,
  employeeVerificationRequests,
  employeeVerificationHistory,
  nameChangeRequests,
  nameChangeRequestHistory,
  roleRequests,
  roleRequestHistory,
}: Props) {
  const [view, setView] = useState<ManagementView>("users");

  return (
    <div className="mt-8">
      {/* Selector */}
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

          <option value="reimbursements">Reimbursement History</option>
        </select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Users                                                              */}
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
      {/* Employee Verification                                             */}
      {/* ------------------------------------------------------------------ */}

      {view === "employee-verification" && (
        <>
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Employee Verification
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review employee identity verification requests submitted for
                administrative approval.
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
                Review previously approved and rejected employee verification
                requests.
              </p>
            </div>

            <EmployeeVerificationHistoryTable
              requests={employeeVerificationHistory}
            />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Name Change                                                       */}
      {/* ------------------------------------------------------------------ */}

      {view === "name-change" && (
        <>
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Name Change Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review requests to change account names.
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
      {/* Role Verification                                                 */}
      {/* ------------------------------------------------------------------ */}

      {view === "role-verification" && (
        <>
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Role Verification Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review employee requests for ADMIN or HR role verification.
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
      {/* Reimbursements                                                    */}
      {/* ------------------------------------------------------------------ */}

      {view === "reimbursements" && (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Reimbursement History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review expenses that have been reimbursed, including the Admin who
              approved them and the HR member who processed the reimbursement.
            </p>
          </div>

          <ReimbursementHistoryTable expenses={reimbursementExpenses} />
        </section>
      )}
    </div>
  );
}
