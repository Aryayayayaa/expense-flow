import { redirect } from "next/navigation";

import { auth } from "@/auth";

import RequestsPageClient from "@/features/auth/components/RequestsPageClient";

import {
  getNameChangeRequestHistory,
  getNameChangeRequestsForUser,
  getPendingNameChangeRequests,
} from "@/features/auth/lib/name-change-requests";

import {
  getPendingRoleRequests,
  getRoleRequestHistory,
  getRoleRequestsForUser,
} from "@/features/auth/lib/role-requests";

import {
  getEmployeeVerificationHistory,
  getEmployeeVerificationRequestsForUser,
  getLatestEmployeeVerificationRequest,
  getPendingEmployeeVerificationRequests,
} from "@/features/auth/lib/employee-verification";

type RequestsPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function RequestsPage({
  searchParams,
}: RequestsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;

  const requestedType = params.type;

  const requestType =
    requestedType === "name-change" ||
    requestedType === "role-verification" ||
    requestedType === "identity-verification"
      ? requestedType
      : "name-change";

  const userId = Number(session.user.id);

  const isEmployee = session.user.role === "EMPLOYEE";

  const isHrOrAdmin =
    session.user.role === "HR" || session.user.role === "ADMIN";

  /* ---------------------------------------------------------------------- */
  /* EMPLOYEE                                                               */
  /* ---------------------------------------------------------------------- */

  if (isEmployee) {
    const [
      nameChangeRequests,
      roleRequests,
      identityRequests,
      latestIdentityRequest,
    ] = await Promise.all([
      getNameChangeRequestsForUser(userId),
      getRoleRequestsForUser(userId),
      getEmployeeVerificationRequestsForUser(userId),
      getLatestEmployeeVerificationRequest(userId),
    ]);

    return (
      <RequestsPageClient
        userRole={session.user.role}
        userName={session.user.name ?? ""}
        initialType={requestType}
        employeeData={{
          nameChangeRequests,
          roleRequests,
          identityRequests,
          latestIdentityRequest,
        }}
      />
    );
  }

  /* ---------------------------------------------------------------------- */
  /* HR / ADMIN                                                             */
  /* ---------------------------------------------------------------------- */

  if (isHrOrAdmin) {
    const [
      pendingNameChangeRequests,
      nameChangeRequestHistory,
      pendingRoleRequests,
      roleRequestHistory,
      pendingIdentityRequests,
      identityRequestHistory,
    ] = await Promise.all([
      getPendingNameChangeRequests(),
      getNameChangeRequestHistory(),
      getPendingRoleRequests(),
      getRoleRequestHistory(),
      getPendingEmployeeVerificationRequests(),
      getEmployeeVerificationHistory(),
    ]);

    return (
      <RequestsPageClient
        userRole={session.user.role}
        userName={session.user.name ?? ""}
        initialType={requestType}
        managementData={{
          pendingNameChangeRequests,
          nameChangeRequestHistory,
          pendingRoleRequests,
          roleRequestHistory,
          pendingIdentityRequests,
          identityRequestHistory,
        }}
      />
    );
  }

  redirect("/dashboard");
}
