import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminOverview } from "@/features/admin/lib/admin";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const overview = await getAdminOverview();

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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-medium text-slate-500">
                      Name
                    </th>

                    <th className="px-5 py-4 font-medium text-slate-500">
                      Email
                    </th>

                    <th className="px-5 py-4 font-medium text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-4 font-medium text-slate-500">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {overview.users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {user.name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">{user.email}</td>

                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.createdAt.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}

                  {overview.users.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-slate-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

function RoleBadge({ role }: { role: "ADMIN" | "HR" | "EMPLOYEE" }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {role}
    </span>
  );
}
