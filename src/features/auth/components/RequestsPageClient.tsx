"use client";

import { useRouter, useSearchParams } from "next/navigation";

import NameChangeRequest from "./NameChangeRequest";
import RoleVerificationRequest from "./RoleVerificationRequest";
import EmployeeVerificationRequest from "./EmployeeVerificationRequest";

import NameChangeRequestTable from "./NameChangeRequestTable";
import NameChangeRequestHistoryTable from "./NameChangeRequestHistoryTable";
import RoleVerificationTable from "./RoleVerificationTable";
import EmployeeVerificationTable from "./EmployeeVerificationTable";
import EmployeeVerificationHistoryTable from "./EmployeeVerificationHistoryTable";

import type {
  EmployeeVerificationStatus,
  NameChangeRequestStatus,
  Role,
  RoleRequestStatus,
} from "@prisma/client";

type RequestType =
  | "name-change"
  | "role-verification"
  | "identity-verification";

type RequestsPageClientProps = {
  userRole: Role;
  userName: string;
  initialType: RequestType;
  employeeData?: EmployeeData;
  managementData?: ManagementData;
};

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

type RequestUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type Reviewer = {
  id: number;
  name: string;
  email: string;
  role: Role;
} | null;

type NameChangeRequestData = {
  id: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl: string | null;
  proofPath: string | null;
  status: NameChangeRequestStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  user: RequestUser;
  reviewedBy: Reviewer;
};

type RoleRequestData = {
  id: number;
  requestedRole: Role;
  status: RoleRequestStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  proofUrl: string | null;
  proofPath: string | null;
  user: RequestUser;
  reviewedBy: Reviewer;
};

type IdentityRequestData = {
  id: number;
  proofUrl: string | null;
  proofPath: string | null;
  status: EmployeeVerificationStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  user: RequestUser;
  reviewedBy: Reviewer;
};

/* -------------------------------------------------------------------------- */
/* Employee data                                                              */
/* -------------------------------------------------------------------------- */

type EmployeeData = {
  nameChangeRequests: NameChangeRequestData[];
  roleRequests: RoleRequestData[];
  identityRequests: IdentityRequestData[];
  latestIdentityRequest: IdentityRequestData | null;
};

/* -------------------------------------------------------------------------- */
/* Management data                                                            */
/* -------------------------------------------------------------------------- */

type ManagementData = {
  pendingNameChangeRequests: NameChangeRequestData[];
  nameChangeRequestHistory: NameChangeRequestData[];

  pendingRoleRequests: RoleRequestData[];
  roleRequestHistory: RoleRequestData[];

  pendingIdentityRequests: IdentityRequestData[];
  identityRequestHistory: IdentityRequestData[];
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function RequestsPageClient({
  userRole,
  userName,
  initialType,
  employeeData,
  managementData,
}: RequestsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedType = getValidRequestType(
    searchParams.get("type") ?? initialType,
  );

  function handleTypeChange(type: RequestType) {
    router.push(`/requests?type=${type}`);
  }

  const isEmployee = userRole === "EMPLOYEE";
  const isHrOrAdmin = userRole === "HR" || userRole === "ADMIN";

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-slate-300 pb-8 dark:border-slate-800">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Claims
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Submit, review, and track account-related requests.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Request Type Selector                                             */}
        {/* ---------------------------------------------------------------- */}


        {/* ---------------------------------------------------------------- */}
        {/* Employee                                                         */}
        {/* ---------------------------------------------------------------- */}

        {isEmployee && employeeData && (
          <EmployeeRequests
            selectedType={selectedType}
            currentName={userName}
            userRole={userRole}
            data={employeeData}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* HR / ADMIN                                                       */}
        {/* ---------------------------------------------------------------- */}

        {isHrOrAdmin && managementData && (
          <ManagementRequests
            selectedType={selectedType}
            userRole={userRole}
            data={managementData}
          />
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Employee Requests                                                          */
/* -------------------------------------------------------------------------- */

type EmployeeRequestsProps = {
  selectedType: RequestType;
  currentName: string;
  userRole: Role;
  data: EmployeeData;
};

function EmployeeRequests({
  selectedType,
  currentName,
  userRole,
  data,
}: EmployeeRequestsProps) {
  const latestIdentityRequest = data.latestIdentityRequest;

  const identityStatus = latestIdentityRequest?.status ?? "NOT_SUBMITTED";

  return (
    <section className="mt-6 space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Name Change                                                        */}
      {/* ------------------------------------------------------------------ */}

      {selectedType === "name-change" && (
        <>
          <NameChangeRequest currentName={currentName} />

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                My Name Change History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your previously submitted name change requests.
              </p>
            </div>

            <NameChangeRequestHistoryTable requests={data.nameChangeRequests} />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Role Verification                                                  */}
      {/* ------------------------------------------------------------------ */}

      {selectedType === "role-verification" && (
        <>
          <RoleVerificationRequest currentRole={userRole} />

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                My Role Verification History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your previously submitted role verification requests.
              </p>
            </div>

            <RoleVerificationHistoryTable requests={data.roleRequests} />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Identity Verification                                              */}
      {/* ------------------------------------------------------------------ */}

      {selectedType === "identity-verification" && (
        <>
          <EmployeeVerificationRequest
            requestId={latestIdentityRequest?.id}
            status={identityStatus}
            rejectionReason={latestIdentityRequest?.rejectionReason}
          />

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                My Identity Verification History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your previously submitted identity verification requests.
              </p>
            </div>

            <EmployeeVerificationHistoryTable
              requests={data.identityRequests}
            />
          </section>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* HR / ADMIN Requests                                                        */
/* -------------------------------------------------------------------------- */

type ManagementRequestsProps = {
  selectedType: RequestType;
  userRole: Role;
  data: ManagementData;
};

function ManagementRequests({
  selectedType,
  userRole,
  data,
}: ManagementRequestsProps) {
  return (
    <section className="mt-6 space-y-10">
      {/* ------------------------------------------------------------------ */}
      {/* Name Change                                                        */}
      {/* ------------------------------------------------------------------ */}

      {selectedType === "name-change" && (
        <>
          <section>
            <ManagementSectionHeader
              title="Pending Name Change Requests"
              description="Review employee requests to change their account name."
            />

            <NameChangeRequestTable requests={data.pendingNameChangeRequests} />
          </section>

          <section>
            <ManagementSectionHeader
              title="Name Change History"
              description="Previously approved and rejected name change requests."
            />

            <NameChangeRequestHistoryTable
              requests={data.nameChangeRequestHistory}
            />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Role Verification                                                  */}
      {/* ------------------------------------------------------------------ */}

      {selectedType === "role-verification" && (
        <>
          <section>
            <ManagementSectionHeader
              title="Pending Role Verification Requests"
              description="Review employee requests for ADMIN or HR privileges."
            />

            <RoleVerificationTable
              requests={data.pendingRoleRequests}
              canReview={true}
            />
          </section>

          <section>
            <ManagementSectionHeader
              title="Role Verification History"
              description="Previously approved and rejected role verification requests."
            />

            <RoleVerificationHistoryTable requests={data.roleRequestHistory} />
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Identity Verification                                              */}
      {/* ------------------------------------------------------------------ */}

      {selectedType === "identity-verification" && (
        <>
          <section>
            <ManagementSectionHeader
              title="Pending Identity Verification"
              description="Review employee identity and employment verification documents."
            />

            <EmployeeVerificationTable
              requests={data.pendingIdentityRequests}
            />
          </section>

          <section>
            <ManagementSectionHeader
              title="Identity Verification History"
              description="Previously approved and rejected identity verification requests."
            />

            <EmployeeVerificationHistoryTable
              requests={data.identityRequestHistory}
            />
          </section>
        </>
      )}

      <p className="text-xs text-slate-400">
        {userRole === "ADMIN"
          ? "Administration can review and manage employee requests."
          : "People Management can review and manage employee requests."}
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Management Section Header                                                 */
/* -------------------------------------------------------------------------- */

function ManagementSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Role Verification History                                                 */
/* -------------------------------------------------------------------------- */

function RoleVerificationHistoryTable({
  requests,
}: {
  requests: RoleRequestData[];
}) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No role verification history available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500">Employee</th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Requested Role
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Submitted
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">Status</th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Reviewed By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Reviewed On
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Rejection Reason
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => {
              const statusClass =
                request.status === "APPROVED"
                  ? "bg-green-50 text-green-700"
                  : request.status === "REJECTED"
                    ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700";

              return (
                <tr key={request.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {request.user.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {request.user.email}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {request.requestedRole}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(request.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {request.reviewedBy?.name ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {request.reviewedAt ? formatDate(request.reviewedAt) : "—"}
                  </td>

                  <td className="max-w-xs px-5 py-4 text-slate-600">
                    {request.rejectionReason ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getValidRequestType(value: string): RequestType {
  if (
    value === "name-change" ||
    value === "role-verification" ||
    value === "identity-verification"
  ) {
    return value;
  }

  return "name-change";
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
