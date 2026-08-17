import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAnalyticsData } from "@/features/analytics/lib/getAnalyticsData";

import ReportsPageClient from "@/features/reports/components/ReportsPageClient";
import ReportsFilters from "@/features/reports/components/ReportsFilters";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;

  const scope =
    params.scope === "ALL" || params.scope === "EMPLOYEES"
      ? params.scope
      : "OWN";

  const expenses = await getAnalyticsData(scope);

  const canChooseScope =
    session.user.role === "ADMIN" || session.user.role === "HR";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>

      <p className="mt-2 text-sm text-slate-500">
        Review summaries and detailed insights from your expenses.
      </p>

      {canChooseScope && (
        <div className="mt-6">
          <ReportsPageClient scope={scope} />
        </div>
      )}

      <div className="mt-6">
        <ReportsFilters expenses={expenses} />
      </div>
    </div>
  );
}
