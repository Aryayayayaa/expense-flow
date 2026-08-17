import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import RoleVerificationRequest from "@/features/auth/components/RoleVerificationRequest";
import EmployeeVerificationRequest from "@/features/auth/components/EmployeeVerificationRequest";
import ProfileEditor from "@/features/auth/components/ProfileEditor";

import { getLatestEmployeeVerificationRequest } from "@/features/auth/lib/employee-verification";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    select: {
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const verificationRequest =
    user.role === "EMPLOYEE"
      ? await getLatestEmployeeVerificationRequest(Number(session.user.id))
      : null;

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>

          <p className="mt-2 text-sm text-slate-500">
            View your account information and role.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Name</p>

              <p className="mt-1 text-lg font-medium text-slate-900">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>

              <p className="mt-1 text-lg text-slate-900">{user.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Role</p>

              <p className="mt-1 text-lg font-medium text-slate-900">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Member Since</p>

              <p className="mt-1 text-lg text-slate-900">
                {user.createdAt.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <ProfileEditor name={user.name} email={user.email} />

        <RoleVerificationRequest currentRole={user.role} />

        {user.role === "EMPLOYEE" && (
          <EmployeeVerificationRequest
            requestId={verificationRequest?.id}
            status={verificationRequest?.status ?? "NOT_SUBMITTED"}
            rejectionReason={verificationRequest?.rejectionReason}
          />
        )}
      </div>
    </main>
  );
}
