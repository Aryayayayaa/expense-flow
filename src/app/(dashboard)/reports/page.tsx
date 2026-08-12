import { getAnalyticsData } from "@/features/analytics/lib/getAnalyticsData";

import OverviewSummaryCards from "@/features/analytics/components/OverviewSummaryCards";
import CategoryComparisonChart from "@/features/analytics/components/charts/CategoryComparisonChart";

import ReportSummary from "@/features/analytics/components/reports/ReportSummary";
import SpendingSummary from "@/features/analytics/components/reports/SpendingSummary";
import LargestExpenses from "@/features/analytics/components/reports/LargestExpenses";
import TopCategories from "@/features/analytics/components/reports/TopCategories";

export default async function ReportsPage() {
  const expenses = await getAnalyticsData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>

      <p className="mt-2 text-sm text-slate-500">
        Review summaries and detailed insights from your expenses.
      </p>

      <div className="mt-6 space-y-6">
        <OverviewSummaryCards expenses={expenses} />

        <CategoryComparisonChart expenses={expenses} />

        <ReportSummary expenses={expenses} />

        <SpendingSummary expenses={expenses} />

        <LargestExpenses expenses={expenses} />

        <TopCategories expenses={expenses} />
      </div>
    </div>
  );
}
