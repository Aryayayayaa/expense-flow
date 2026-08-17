import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminOverview } from "@/features/admin/lib/admin";
import { getReimbursementHistory } from "@/features/expenses/lib/expenses";

import ReimbursementHistoryTable from "@/features/expenses/components/ReimbursementHistoryTable";
import UserManagementTable from "@/features/admin/components/UserManagementTable";

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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Admin
          </h1>

          <p className="mt-2 text-sm text-slate-500">
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

        {/* Users */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Users</h2>

            <p className="mt-1 text-sm text-slate-500">
              View all registered users and their current roles.
            </p>
          </div>

          <UserManagementTable users={overview.users} />
        </section>

        {/* Reimbursement History */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Reimbursement History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review expenses that have been reimbursed, including the Admin who
              approved them and the HR member who processed the reimbursement.
            </p>
          </div>

          <ReimbursementHistoryTable expenses={reimbursementHistory.expenses} />
        </section>
      </div>
    </main>
  );
}

function OverviewCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
