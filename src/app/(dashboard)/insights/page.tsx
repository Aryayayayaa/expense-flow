import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { CurrencyCode } from "@/constants/currencies";

import { getAnalyticsData } from "@/features/analytics/lib/getAnalyticsData";
import InsightsPageClient from "@/features/insights/components/InsightsPageClient";

export default async function InsightsPage({
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
        Insights
      </h1>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Analyze your expenses and review detailed spending insights.
      </p>

      <div className="mt-6">
        <InsightsPageClient
          expenses={expenses}
          scope={scope}
          role={session.user.role}
          canChooseScope={canChooseScope}
          defaultCurrency={session.user.defaultCurrency as CurrencyCode}
        />
      </div>
    </div>
  );
}
