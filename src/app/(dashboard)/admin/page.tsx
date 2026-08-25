import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { getAdminOverview } from "@/features/admin/lib/admin";

import {
  getEmployeeVerificationHistory,
  getEmployeeVerificationAttemptCount,
  getEmployeeVerificationRequestsForUser,
  getLatestEmployeeVerificationRequest,
  getPendingEmployeeVerificationRequests,
} from "@/features/auth/lib/employee-verification";

import {
  getNameChangeRequestHistory,
  getNameChangeRequestsForUser,
  getPendingNameChangeRequests,
} from "@/features/auth/lib/name-change-requests";

import {
  getPendingRoleRequests,
  getRoleRequestHistory,
} from "@/features/auth/lib/role-requests";

import AdminManagementSelector from "@/features/admin/components/AdminManagementSelector";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const adminId = Number(session.user.id);

  const [
    overview,
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
  ] = await Promise.all([
    getAdminOverview(),

    getPendingEmployeeVerificationRequests(adminId),

    getEmployeeVerificationHistory(adminId),

    getEmployeeVerificationRequestsForUser(adminId),

    getLatestEmployeeVerificationRequest(adminId),

    getEmployeeVerificationAttemptCount(adminId),

    getPendingNameChangeRequests(adminId),

    getNameChangeRequestHistory(adminId),

    getNameChangeRequestsForUser(adminId),

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
            Administration
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage users, verification requests, role requests, and
            administrative activities.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Overview                                                          */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid gap-4 sm:grid-cols-2">
          <OverviewCard label="Total Users" value={overview.totalUsers} />

          <OverviewCard
            label="Pending Expenses"
            value={overview.pendingExpenses}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Administration Selector                                           */}
        {/* ---------------------------------------------------------------- */}

        <AdminManagementSelector
          userId={adminId}
          userName={session.user.name ?? ""}
          users={overview.users}
          /* Employee Verification */
          employeeVerificationRequests={employeeVerificationRequests}
          employeeVerificationHistory={employeeVerificationHistory}
          ownIdentityRequests={ownIdentityRequests}
          latestOwnIdentityRequest={latestOwnIdentityRequest}
          ownIdentityAttemptCount={ownIdentityAttemptCount}
          /* Name Change */
          nameChangeRequests={nameChangeRequests}
          nameChangeRequestHistory={nameChangeRequestHistory}
          ownNameChangeRequests={ownNameChangeRequests}
          /* Role Verification */
          roleRequests={roleRequests}
          roleRequestHistory={roleRequestHistory}
        />
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Overview Card                                                              */
/* -------------------------------------------------------------------------- */

function OverviewCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
