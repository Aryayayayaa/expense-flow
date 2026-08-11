import Link from "next/link";
import { BarChart3, Receipt, User } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="dashboard-background relative min-h-screen overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 bg-black/55" />

      {/* Dashboard content */}
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white">
            Welcome to ExpenseFlow💰
          </h1>

          <p className="mt-3 text-lg text-gray-200">
            Manage your expenses, analyze your spending, and keep track of your
            financial activity.
          </p>
        </div>

        <br />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/expenses"
            className="group rounded-xl border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
          >
            <Receipt className="mb-4 h-8 w-8 text-blue-600" />

            <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>

            <p className="mt-2 text-sm text-gray-500">
              Add, search, filter, sort, and manage your expenses.
            </p>

            <span className="mt-5 inline-block text-sm font-medium text-blue-600">
              Go to Expenses →
            </span>
          </Link>

          <Link
            href="/analytics"
            className="group rounded-xl border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
          >
            <BarChart3 className="mb-4 h-8 w-8 text-green-600" />

            <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>

            <p className="mt-2 text-sm text-gray-500">
              Understand your spending patterns through charts and reports.
            </p>

            <span className="mt-5 inline-block text-sm font-medium text-green-600">
              View Analytics →
            </span>
          </Link>

          <Link
            href="/profile"
            className="group rounded-xl border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
          >
            <User className="mb-4 h-8 w-8 text-purple-600" />

            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>

            <p className="mt-2 text-sm text-gray-500">
              View and manage your account information.
            </p>

            <span className="mt-5 inline-block text-sm font-medium text-purple-600">
              View Profile →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
