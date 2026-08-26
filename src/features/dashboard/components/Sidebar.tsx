"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";

import ThemeToggle from "./ThemeToggle";
import LogoutButton from "@/features/auth/components/LogoutButton";
import type { Role } from "@prisma/client";

type SidebarProps = {
  userRole?: Role;
};

export default function Sidebar({ userRole }: SidebarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /* -------------------------------------------------------------------------- */
  /* Sidebar Groups                                                              */
  /* -------------------------------------------------------------------------- */

  const isRequestsOpen = pathname.startsWith("/requests");
  const isReimbursementsOpen = pathname.startsWith("/reimbursements");
  const isHROpen = pathname.startsWith("/hr");
  const isAdminOpen = pathname.startsWith("/admin");

  /* -------------------------------------------------------------------------- */
  /* Render                                                                      */
  /* -------------------------------------------------------------------------- */

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden border-r border-slate-200 bg-white md:flex md:flex-col dark:border-slate-800 dark:bg-slate-900">
      {/* Logo */}
      <div className="shrink-0 border-b border-slate-200 px-6 py-6 dark:border-slate-800">
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
      <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6">
        <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {/* ------------------------------------------------------------------ */}
          {/* Dashboard                                                          */}
          {/* ------------------------------------------------------------------ */}

          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            tooltip="View your expense overview and spending summary"
            icon={<DashboardIcon />}
            active={pathname === "/dashboard"}
          />

          {/* ------------------------------------------------------------------ */}
          {/* Expenses                                                           */}
          {/* ------------------------------------------------------------------ */}

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

          {/* ------------------------------------------------------------------ */}
          {/* Approvals                                                          */}
          {/* ------------------------------------------------------------------ */}

          <SidebarLink
            href="/approvals"
            label="Approvals"
            tooltip="Review and manage expense approvals"
            icon={<CheckIcon />}
            active={pathname.startsWith("/approvals")}
          />

          {/* ------------------------------------------------------------------ */}
          {/* Reimbursements                                                     */}
          {/* ------------------------------------------------------------------ */}

          {(userRole === "ADMIN" || userRole === "HR") && (
            <>
              <SidebarLink
                href="/reimbursements"
                label="Reimbursements"
                tooltip="Process expense reimbursements and view reimbursement history"
                icon={<WalletIcon />}
                active={false}
              />

              {isReimbursementsOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {/* Default: Employees */}
                  <SidebarLink
                    href="/reimbursements?reimbursementScope=EMPLOYEES"
                    label="Employees"
                    tooltip="View employee expenses for reimbursement"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/reimbursements" &&
                      (!searchParams.get("reimbursementScope") ||
                        searchParams.get("reimbursementScope") ===
                          "EMPLOYEES")
                    }
                  />

                  <SidebarLink
                    href="/reimbursements?reimbursementScope=OWN"
                    label="Own Expenses"
                    tooltip="View your own approved expenses"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/reimbursements" &&
                      searchParams.get("reimbursementScope") === "OWN"
                    }
                  />

                  {/* HR Scopes */}
                  {userRole === "HR" && (
                    <>
                      <SidebarLink
                        href="/reimbursements?reimbursementScope=OTHER_HRS"
                        label="Other HRs"
                        tooltip="View expenses submitted by other HR users"
                        icon={<span className="text-xs">•</span>}
                        active={
                          pathname === "/reimbursements" &&
                          searchParams.get("reimbursementScope") ===
                            "OTHER_HRS"
                        }
                      />

                      <SidebarLink
                        href="/reimbursements?reimbursementScope=ADMINS"
                        label="Admins"
                        tooltip="View admin expenses for reimbursement"
                        icon={<span className="text-xs">•</span>}
                        active={
                          pathname === "/reimbursements" &&
                          searchParams.get("reimbursementScope") === "ADMINS"
                        }
                      />
                    </>
                  )}

                  {/* Admin Scopes */}
                  {userRole === "ADMIN" && (
                    <>
                      <SidebarLink
                        href="/reimbursements?reimbursementScope=OTHER_ADMINS"
                        label="Other Admins"
                        tooltip="View expenses submitted by other admins"
                        icon={<span className="text-xs">•</span>}
                        active={
                          pathname === "/reimbursements" &&
                          searchParams.get("reimbursementScope") ===
                            "OTHER_ADMINS"
                        }
                      />

                      <SidebarLink
                        href="/reimbursements?reimbursementScope=HRS"
                        label="HRs"
                        tooltip="View HR expenses for reimbursement"
                        icon={<span className="text-xs">•</span>}
                        active={
                          pathname === "/reimbursements" &&
                          searchParams.get("reimbursementScope") === "HRS"
                        }
                      />
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Insights                                                           */}
          {/* ------------------------------------------------------------------ */}

          <SidebarLink
            href="/insights"
            label="Insights"
            tooltip="Analyze spending trends, categories, and reports"
            icon={<AnalysisIcon />}
            active={pathname.startsWith("/insights")}
          />

          {/* ------------------------------------------------------------------ */}
          {/* Employee Claims                                                    */}
          {/* ------------------------------------------------------------------ */}

          {userRole === "EMPLOYEE" && (
            <>
              <SidebarLink
                href="/requests"
                label="Claims"
                tooltip="Submit and track your account-related requests"
                icon={<RequestsIcon />}
                active={false}
              />

              {isRequestsOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {/* Default: Name Change */}
                  <SidebarLink
                    href="/requests?type=name-change"
                    label="Name Change"
                    tooltip="Submit a name change request"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/requests" &&
                      (!searchParams.get("type") ||
                        searchParams.get("type") === "name-change")
                    }
                  />

                  <SidebarLink
                    href="/requests?type=role-verification"
                    label="Role Verification"
                    tooltip="Submit a role verification request"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/requests" &&
                      searchParams.get("type") === "role-verification"
                    }
                  />

                  <SidebarLink
                    href="/requests?type=identity-verification"
                    label="Identity Verification"
                    tooltip="Submit an identity verification request"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/requests" &&
                      searchParams.get("type") === "identity-verification"
                    }
                  />
                </div>
              )}
            </>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Administration                                                     */}
          {/* ------------------------------------------------------------------ */}

          {userRole === "ADMIN" && (
  <>
    {/* Main Administration Section */}
    <SidebarLink
      href="/admin"
      label="Administration"
      tooltip="Manage users, expenses, and administrative activities"
      icon={<SettingsIcon />}
      active={false}
    />

    {/* Administration Submenus */}
    {isAdminOpen && (
      <div className="ml-6 mt-1 space-y-1">
        {/* Default: Users */}
        <SidebarLink
          href="/admin?view=users"
          label="Users"
          tooltip="Manage users and their accounts"
          icon={<span className="text-xs">•</span>}
          active={
            pathname === "/admin" &&
            (
              !searchParams.get("view") ||
              searchParams.get("view") === "users"
            )
          }
        />

        <SidebarLink
          href="/admin?view=employee-verification"
          label="Employee Verification"
          tooltip="Review employee verification requests"
          icon={<span className="text-xs">•</span>}
          active={
            pathname === "/admin" &&
            searchParams.get("view") === "employee-verification"
          }
        />

        <SidebarLink
          href="/admin?view=name-change"
          label="Name Change Requests"
          tooltip="Review name change requests"
          icon={<span className="text-xs">•</span>}
          active={
            pathname === "/admin" &&
            searchParams.get("view") === "name-change"
          }
        />

        <SidebarLink
          href="/admin?view=role-verification"
          label="Role Verification Requests"
          tooltip="Review role verification requests"
          icon={<span className="text-xs">•</span>}
          active={
            pathname === "/admin" &&
            searchParams.get("view") === "role-verification"
          }
        />
      </div>
    )}
  </>
)}

          {/* ------------------------------------------------------------------ */}
          {/* People Management                                                  */}
          {/* ------------------------------------------------------------------ */}

          {userRole === "HR" && (
            <>
              <SidebarLink
                href="/hr"
                label="People Management"
                tooltip="Manage employee verification, requests, and HR activities"
                icon={<SettingsIcon />}
                active={false}
              />

              {isHROpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {/* Default: Employee Verification */}
                  <SidebarLink
                    href="/hr?section=verification"
                    label="Employee Verification"
                    tooltip="Manage identity verification requests"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/hr" &&
                      (!searchParams.get("section") ||
                        searchParams.get("section") === "verification")
                    }
                  />

                  <SidebarLink
                    href="/hr?section=name-change"
                    label="Name Change Requests"
                    tooltip="Manage name change requests"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/hr" &&
                      searchParams.get("section") === "name-change"
                    }
                  />

                  <SidebarLink
                    href="/hr?section=role-verification"
                    label="Role Verification Requests"
                    tooltip="Manage employee role verification requests"
                    icon={<span className="text-xs">•</span>}
                    active={
                      pathname === "/hr" &&
                      searchParams.get("section") === "role-verification"
                    }
                  />
                </div>
              )}
            </>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Profile                                                            */}
          {/* ------------------------------------------------------------------ */}

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
      <div className="mt-auto shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
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
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const updateTooltipPos = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();

    setTooltipPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  return (
    <div
      className="relative"
      onMouseEnter={(event) => updateTooltipPos(event.currentTarget)}
      onMouseLeave={() => setTooltipPos(null)}
      onFocus={(event) => updateTooltipPos(event.currentTarget)}
      onBlur={() => setTooltipPos(null)}
    >
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

      {tooltipPos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
            className="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-slate-700"
          >
            {tooltip}
          </div>,
          document.body,
        )}
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M16 12h5" />
      <circle cx="16" cy="12" r="1" />
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
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1Z" />
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
