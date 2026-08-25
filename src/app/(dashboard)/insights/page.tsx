import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { CurrencyCode } from "@/constants/currencies";

import {
  getAnalyticsData,
  type AnalyticsScope,
} from "@/features/analytics/lib/getAnalyticsData";

import InsightsPageClient from "@/features/insights/components/InsightsPageClient";

function getValidScope(
  requestedScope: string | undefined,
  role: "ADMIN" | "HR" | "EMPLOYEE",
): AnalyticsScope {
  /*
   * ---------------------------------------------------------
   * ADMIN scopes
   * ---------------------------------------------------------
   */
  if (role === "ADMIN") {
    if (
      requestedScope === "OWN" ||
      requestedScope === "ALL" ||
      requestedScope === "EMPLOYEES" ||
      requestedScope === "OTHER_ADMINS" ||
      requestedScope === "HRS"
    ) {
      return requestedScope;
    }

    return "OWN";
  }

  /*
   * ---------------------------------------------------------
   * HR scopes
   * ---------------------------------------------------------
   */
  if (role === "HR") {
    if (
      requestedScope === "OWN" ||
      requestedScope === "ALL" ||
      requestedScope === "EMPLOYEES" ||
      requestedScope === "OTHER_HRS" ||
      requestedScope === "ADMINS"
    ) {
      return requestedScope;
    }

    return "OWN";
  }

  /*
   * ---------------------------------------------------------
   * EMPLOYEE
   * ---------------------------------------------------------
   *
   * Employees can only view their own expenses.
   */
  return "OWN";
}

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

  const role = session.user.role;

  const scope = getValidScope(params.scope, role);

  const expenses = await getAnalyticsData(scope);

  const canChooseScope = role === "ADMIN" || role === "HR";

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
          role={role}
          canChooseScope={canChooseScope}
          defaultCurrency={session.user.defaultCurrency as CurrencyCode}
        />
      </div>
    </div>
  );
}
