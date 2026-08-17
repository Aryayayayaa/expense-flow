import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAllRoleRequests } from "@/features/auth/lib/role-requests";
import RoleVerificationTable from "@/features/auth/components/RoleVerificationTable";

export default async function RoleVerificationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
    redirect("/dashboard");
  }

  const requests = await getAllRoleRequests();

  const canReview = session.user.role === "HR";

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Role Verification
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {canReview
              ? "Review employee requests for ADMIN and HR privileges."
              : "View employee role verification requests and their current status."}
          </p>
        </div>

        <RoleVerificationTable requests={requests} canReview={canReview} />
      </div>
    </main>
  );
}
