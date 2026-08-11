import LogoutButton from "@/features/auth/components/LogoutButton";
import AnalyticsPageClient from "@/features/analytics/components/AnalyticsPageClient";

import { getExpenses } from "@/features/expenses/lib/expenses";
import { auth } from "@/auth";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const expenses = await getExpenses(Number(session.user.id));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">🧮 Analytics</h1>
          <LogoutButton />
        </div>

        <p className="mt-2 text-gray-550 text-left text-md">
          Analyze your expenses and understand your spending patterns.
        </p>
      </div>

      <AnalyticsPageClient expenses={expenses} />
    </main>
  );
}
