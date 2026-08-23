"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ThemeToggle from "./ThemeToggle";
import LogoutButton from "@/features/auth/components/LogoutButton";
import type { Role } from "@prisma/client";

type SidebarProps = {
  userRole?: Role;
};

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col dark:border-slate-800 dark:bg-slate-900">
      {/* Logo */}
      <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800">
        <Link
          href="/dashboard"
          className="text-2xl font-semibold tracking-tight"
        >
          Expense<span className="text-blue-600">Flow</span>
        </Link>

        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Finance Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            tooltip="View your expense overview and spending summary"
            icon={<DashboardIcon />}
            active={pathname === "/dashboard"}
          />

          <SidebarLink
            href="/expenses"
            label="My Expenses"
            tooltip="View and manage your submitted expenses"
            icon={<ExpenseIcon />}
            active={pathname === "/expenses"}
          />

          <SidebarLink
            href="/expenses/new"
            label="New Expense"
            tooltip="Create and submit a new expense"
            icon={<PlusIcon />}
            active={pathname === "/expenses/new"}
          />

          <SidebarLink
            href="/approvals"
            label="Approvals"
            tooltip="Review and manage expense approvals"
            icon={<CheckIcon />}
            active={pathname.startsWith("/approvals")}
          />

          <SidebarLink
            href="/insights"
            label="Insights"
            tooltip="Analyze spending trends, categories, and reports"
            icon={<AnalysisIcon />}
            active={pathname.startsWith("/insights")}
          />

          {userRole === "ADMIN" && (
            <SidebarLink
              href="/admin"
              label="Administration"
              tooltip="Manage users, expenses, and administrative activities"
              icon={<SettingsIcon />}
              active={pathname.startsWith("/admin")}
            />
          )}

          {userRole === "HR" && (
            <SidebarLink
              href="/hr"
              label="People Management"
              tooltip="Manage employee verification, requests, and HR activities"
              icon={<SettingsIcon />}
              active={pathname.startsWith("/hr")}
            />
          )}

          <SidebarLink
            href="/profile"
            label="Profile"
            tooltip="View and update your profile settings"
            icon={<ProfileIcon />}
            active={pathname.startsWith("/profile")}
          />
        </div>
      </nav>

      {/* Theme + Logout */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-2">
          <ThemeToggle />
        </div>

        <LogoutButton />
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar Link                                                               */
/* -------------------------------------------------------------------------- */

type SidebarLinkProps = {
  href: string;
  label: string;
  tooltip: string;
  icon: React.ReactNode;
  active?: boolean;
};

function SidebarLink({
  href,
  label,
  tooltip,
  icon,
  active = false,
}: SidebarLinkProps) {
  return (
    <div className="group relative">
      <Link
        href={href}
        aria-label={label}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          active
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        }`}
      >
        {icon}
        {label}
      </Link>

      {/* Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-700"
      >
        {tooltip}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function DashboardIcon() {
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
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

function CheckIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function AnalysisIcon() {
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
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </svg>
  );
}

function ReportIcon() {
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
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

function ProfileIcon() {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function SettingsIcon() {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0-1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function LogoutIcon() {
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
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}

function VerificationIcon() {
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
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function RequestsIcon() {
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
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}
