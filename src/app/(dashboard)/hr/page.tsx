import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPendingEmployeeVerificationRequests } from "@/features/auth/lib/employee-verification";
import EmployeeVerificationTable from "@/features/auth/components/EmployeeVerificationTable";

export default async function HrPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "HR") {
    redirect("/dashboard");
  }

  const requests = await getPendingEmployeeVerificationRequests();

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            HR Verification
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review employee identity and employment verification documents.
          </p>
        </div>

        <EmployeeVerificationTable requests={requests} />
      </div>
    </main>
  );
}
