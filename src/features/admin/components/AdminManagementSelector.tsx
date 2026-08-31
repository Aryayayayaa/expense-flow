"use client";

import { useState } from "react";

import UserManagementTable from "./UserManagementTable";
import { useSearchParams } from "next/navigation";

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
  proofUrl: string | null;
  proofPath: string | null;
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
  userId: number;
  userName: string;
  users: User[];

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
  | "role-verification";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminManagementSelector({
  userName,
  users,

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
  const searchParams = useSearchParams();

  const requestedView = searchParams.get("view");

  const view: ManagementView =
    requestedView === "employee-verification" ||
    requestedView === "name-change" ||
    requestedView === "role-verification"
      ? requestedView
      : "users";
  return (
    <div className="mt-8">
      {/* ------------------------------------------------------------------ */}
      {/* Users                                                              */}
      {/* ------------------------------------------------------------------ */}

      {view === "users" && (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Users
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View all registered users and manage account status.
            </p>
          </div>

          <UserManagementTable users={users} />
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Employee Verification                                              */}
      {/* ------------------------------------------------------------------ */}

      {view === "employee-verification" && (
        <>
          <section>
            {/* <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Identity Verification
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Submit your own identity verification request. Another HR or
                Admin account must review it.
              </p>
            </div> */}

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
      {/* Name Change                                                        */}
      {/* ------------------------------------------------------------------ */}

      {view === "name-change" && (
        <>
          <section>
            {/* <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Request Name Change
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Submit your own name change request. Another HR or Admin account
                must review it.
              </p>
            </div> */}

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
      {/* Role Verification                                                  */}
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
    </div>
  );
}
