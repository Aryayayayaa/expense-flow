import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAllRoleRequests } from "@/features/auth/lib/role-requests";
import Pagination from "@/components/common/Pagination";
import RoleVerificationTable from "@/features/auth/components/RoleVerificationTable";

export default async function RoleVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
    redirect("/dashboard");
  }
  const params = await searchParams;

  const requestedPage = Number(params.page ?? "1");

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const pageSize = 10;

  const requestResult = await getAllRoleRequests(page, pageSize);

  const canReview = session.user.role === "HR";

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Role Verification
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {canReview
              ? "Review employee requests for ADMIN and HR privileges."
              : "View employee role verification requests and their current status."}
          </p>
        </div>

        <RoleVerificationTable
          requests={requestResult.requests}
          canReview={canReview}
        />

        <Pagination
          page={requestResult.page}
          totalPages={requestResult.totalPages}
        />
      </div>
    </main>
  );
}
