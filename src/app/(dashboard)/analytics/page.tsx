import { auth } from "@/auth";

import { redirect } from "next/navigation";

import AnalyticsPageClient from "@/features/analytics/components/AnalyticsPageClient";
import { getAnalyticsData } from "@/features/analytics/lib/getAnalyticsData";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const scope =
    params.scope === "ALL" || params.scope === "EMPLOYEES"
      ? params.scope
      : "OWN";

  const expenses = await getAnalyticsData(scope);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        Analysis
      </h1>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Analyze your expenses across categories and time periods.
      </p>

      <div className="mt-6">
        <AnalyticsPageClient
          expenses={expenses}
          scope={scope}
          role={session.user.role}
        />
      </div>
    </div>
  );
}
