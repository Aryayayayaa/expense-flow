import AnalyticsPageClient from "@/features/analytics/components/AnalyticsPageClient";
import { getAnalyticsData } from "@/features/analytics/lib/getAnalyticsData";

export default async function AnalyticsPage() {
  const expenses = await getAnalyticsData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Analysis</h1>

      <p className="mt-2 text-sm text-slate-500">
        Analyze your expenses across categories and time periods.
      </p>

      <div className="mt-6">
        <AnalyticsPageClient expenses={expenses} />
      </div>
    </div>
  );
}
