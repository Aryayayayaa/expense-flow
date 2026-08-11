import Link from "next/link";

import { getDashboardData } from "@/features/dashboard/lib/getDashboardData";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      {/* Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
        <div className="hidden lg:block">
          <p className="text-sm font-medium text-slate-500">
            Dashboard
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <BellIcon />
          </button>

          <button
            type="button"
            aria-label="Help"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <HelpIcon />
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {data.user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {data.user.name}
            </p>
          </div>

          <Link
            href="/expenses/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <PlusIcon />
            Submit New Expense
          </Link>
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(data.summary.totalSpent)}
            description={`${data.summary.totalExpenses} expenses recorded`}
            icon={<WalletIcon />}
          />

          <StatCard
            title="This Month"
            value={formatCurrency(data.summary.monthlySpent)}
            description="Expenses recorded this month"
            icon={<CalendarIcon />}
          />

          <StatCard
            title="Total Entries"
            value={String(data.summary.totalExpenses)}
            description="Expenses submitted"
            icon={<ExpenseIcon />}
          />
        </div>

        {/* Recent Expenses */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Expenses
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest expense activity
              </p>
            </div>

            <Link
              href="/expenses"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          {data.recentExpenses.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <ExpenseIcon />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No expenses yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first expense to see it here.
              </p>

              <Link
                href="/expenses/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <PlusIcon />
                Add Expense
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Expense
                      </th>

                      <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recentExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(expense.date)}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-900">
                          {expense.title}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {expense.category}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {data.recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="space-y-3 px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {expense.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {expense.category} ·{" "}
                          {formatDate(expense.date)}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              href="/expenses/new"
              title="Submit an Expense"
              description="Add a new expense and upload your receipt."
              icon={<PlusIcon />}
            />

            <QuickAction
              href="/expenses"
              title="View My Expenses"
              description="Review your expenses and their current details."
              icon={<ExpenseIcon />}
            />

            <QuickAction
              href="/expenses"
              title="Track Expenses"
              description="View and manage your submitted expenses."
              icon={<WalletIcon />}
            />
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Quick Action                                                               */
/* -------------------------------------------------------------------------- */

type QuickActionProps = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

function QuickAction({
  href,
  title,
  description,
  icon,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <p className="mt-3 text-sm font-medium text-blue-600">
        Open →
      </p>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ExpenseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2h9l3 3v17H6z" />
      <path d="M14 2v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.9.9-1.9 1.3-1.9 2.9" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6a2 2 0 0 1 2-2h12v16H6a2 2 0 0 1-2-2z" />
      <path d="M4 7h14" />
      <path d="M16 12h4v4h-4a2 2 0 1 1 0-4Z" />
    </svg>
  );
}