import { redirect } from "next/navigation";

import { auth } from "@/auth";

import {
  getEmployeeVerificationHistory,
  getEmployeeVerificationAttemptCount,
  getLatestEmployeeVerificationRequest,
  getPendingEmployeeVerificationRequests,
  getEmployeeVerificationRequestsForUser,
} from "@/features/auth/lib/employee-verification";

import EmployeeVerificationTable from "@/features/auth/components/EmployeeVerificationTable";
import EmployeeVerificationHistoryTable from "@/features/auth/components/EmployeeVerificationHistoryTable";
import EmployeeVerificationRequest from "@/features/auth/components/EmployeeVerificationRequest";

import HrManagementSelector from "@/features/auth/components/HrManagementSelector";

import NameChangeRequest from "@/features/auth/components/NameChangeRequest";
import NameChangeRequestHistoryTable from "@/features/auth/components/NameChangeRequestHistoryTable";
import NameChangeRequestTable from "@/features/auth/components/NameChangeRequestTable";

import RoleVerificationTable from "@/features/auth/components/RoleVerificationTable";
import RoleVerificationHistoryTable from "@/features/auth/components/RoleVerificationHistoryTable";

import {
  getNameChangeRequestHistory,
  getNameChangeRequestsForUser,
  getPendingNameChangeRequests,
} from "@/features/auth/lib/name-change-requests";

import {
  getRoleRequestHistory,
  getPendingRoleRequests,
} from "@/features/auth/lib/role-requests";

type Section = "verification" | "name-change" | "role-verification";

export default async function HrPage({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "HR") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  /* ---------------------------------------------------------------------- */
  /* Management Section                                                     */
  /* ---------------------------------------------------------------------- */

  const section: Section =
    params.section === "name-change" || params.section === "role-verification"
      ? params.section
      : "verification";

  const hrId = Number(session.user.id);

  /* ---------------------------------------------------------------------- */
  /* Data                                                                    */
  /* ---------------------------------------------------------------------- */

  const [
    employeeVerificationRequests,
    employeeVerificationHistory,
    ownIdentityRequests,
    latestOwnIdentityRequest,
    ownIdentityAttemptCount,
    nameChangeRequests,
    nameChangeRequestHistory,
    ownNameChangeRequests,
    roleVerificationRequests,
    roleVerificationHistory,
  ] = await Promise.all([
    getPendingEmployeeVerificationRequests(hrId),

    getEmployeeVerificationHistory(hrId),

    getEmployeeVerificationRequestsForUser(hrId),

    getLatestEmployeeVerificationRequest(hrId),

    getEmployeeVerificationAttemptCount(hrId),

    getPendingNameChangeRequests(hrId),

    getNameChangeRequestHistory(hrId),

    getNameChangeRequestsForUser(hrId),

    getPendingRoleRequests(),

    getRoleRequestHistory(),
  ]);

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* ---------------------------------------------------------------- */}
        {/* Page Header                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            People Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage employee verification, account requests, and role
            verification.
          </p>

          <div className="mt-6">
            <HrManagementSelector section={section} />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Employee Verification                                             */}
        {/* ---------------------------------------------------------------- */}

        {section === "verification" && (
          <>
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Identity Verification
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Submit your own identity verification request and review
                  employee verification requests.
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
                  Review your previously submitted identity verification
                  requests.
                </p>
              </div>

              <EmployeeVerificationHistoryTable
                requests={ownIdentityRequests}
              />
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Employee Verification Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review identity and employment verification requests from
                  other employees.
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

        {/* ---------------------------------------------------------------- */}
        {/* Name Change Requests                                              */}
        {/* ---------------------------------------------------------------- */}

        {section === "name-change" && (
          <>
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Request Name Change
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Submit your own name change request. Another HR or Admin
                  account must review it.
                </p>
              </div>

              <NameChangeRequest currentName={session.user.name ?? ""} />
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
                  Review name change requests submitted by other employees, HR
                  members, and Admins.
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

        {/* ---------------------------------------------------------------- */}
        {/* Role Verification Requests                                        */}
        {/* ---------------------------------------------------------------- */}

        {section === "role-verification" && (
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

              <RoleVerificationTable
                requests={roleVerificationRequests}
                canReview={true}
              />
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

              <RoleVerificationHistoryTable
                requests={roleVerificationHistory}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
