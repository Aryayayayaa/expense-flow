import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminOverview } from "@/features/admin/lib/admin";
import { getReimbursementHistory } from "@/features/expenses/lib/expenses";

import AdminManagementSelector from "@/features/admin/components/AdminManagementSelector";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [overview, reimbursementHistory] = await Promise.all([
    getAdminOverview(),
    getReimbursementHistory(),
  ]);

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Admin
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage users, role verification requests, and expense approvals.
          </p>
        </div>

        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2">
          <OverviewCard label="Total Users" value={overview.totalUsers} />

          <OverviewCard
            label="Pending Expenses"
            value={overview.pendingExpenses}
          />
        </div>

        {/* Management Views */}
        <AdminManagementSelector
          users={overview.users}
          reimbursementExpenses={reimbursementHistory.expenses}
        />
      </div>
    </main>
  );
}

function OverviewCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500 dark:text-black">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-black">
        {value}
      </p>
    </div>
  );
}
