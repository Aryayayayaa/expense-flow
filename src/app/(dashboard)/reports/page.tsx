import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAnalyticsData } from "@/features/analytics/lib/getAnalyticsData";

import ReportsPageClient from "@/features/reports/components/ReportsPageClient";

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
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        Reports
      </h1>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Review summaries and detailed insights from your expenses.
      </p>

      <div className="mt-6">
        <ReportsPageClient
          scope={scope}
          expenses={expenses}
          canChooseScope={canChooseScope}
          defaultCurrency={session.user.defaultCurrency}
        />
      </div>
    </div>
  );
}
