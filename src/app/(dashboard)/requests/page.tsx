import { redirect } from "next/navigation";

import { auth } from "@/auth";

import RequestsPageClient from "@/features/auth/components/RequestsPageClient";

import { getNameChangeRequestsForUser } from "@/features/auth/lib/name-change-requests";

import { getRoleRequestsForUser } from "@/features/auth/lib/role-requests";

import {
  getEmployeeVerificationRequestsForUser,
  getLatestEmployeeVerificationRequest,
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

  /*
   * Requests is an employee-only page.
   *
   * HR and Admin manage requests from their respective
   * management pages instead.
   */
  if (session.user.role !== "EMPLOYEE") {
    if (session.user.role === "HR") {
      redirect("/hr");
    }

    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }

    redirect("/dashboard");
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
      userRole="EMPLOYEE"
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
