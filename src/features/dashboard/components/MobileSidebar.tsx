"use client";

import Link from "next/link";
import { useState } from "react";

import ThemeToggle from "./ThemeToggle";
import LogoutButton from "@/features/auth/components/LogoutButton";
import type { Role } from "@prisma/client";

type MobileSidebarProps = {
  userName?: string | null;
  userRole?: Role;
};

export default function MobileSidebar({
  userName,
  userRole,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const firstName = userName?.trim().split(" ")[0];
  const userInitial = firstName?.charAt(0).toUpperCase() ?? "U";

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <MenuIcon />
        </button>

        <Link
          href="/dashboard"
          className="text-xl font-semibold tracking-tight"
        >
          Expense<span className="text-blue-600">Flow</span>
        </Link>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {userInitial}
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-slate-900/20 md:hidden"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <div>
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="text-xl font-semibold tracking-tight"
            >
              Expense<span className="text-blue-600">Flow</span>
            </Link>

            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Finance Management
            </p>
          </div>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            <MobileNavLink
              href="/dashboard"
              label="Dashboard"
              onClick={closeMenu}
              icon={<DashboardIcon />}
            />

            <MobileNavLink
              href="/expenses"
              label="My Expenses"
              onClick={closeMenu}
              icon={<ExpenseIcon />}
            />

            {/* <MobileNavLink
              href="/expenses/new"
              label="New Expense"
              onClick={closeMenu}
              icon={<PlusIcon />}
            /> */}

            <MobileNavLink
              href="/approvals"
              label="Approvals"
              onClick={closeMenu}
              icon={<CheckIcon />}
            />

            {(userRole === "ADMIN" || userRole === "HR") && (
              <MobileNavLink
                href="/reimbursements"
                label="Reimbursements"
                onClick={closeMenu}
                icon={<WalletIcon />}
              />
            )}

            <MobileNavLink
              href="/insights"
              label="Insights"
              onClick={closeMenu}
              icon={<AnalysisIcon />}
            />

            {userRole === "EMPLOYEE" && (
              <MobileNavLink
                href="/requests"
                label="Claims"
                onClick={closeMenu}
                icon={<RequestsIcon />}
              />
            )}

            {userRole === "ADMIN" && (
              <MobileNavLink
                href="/admin"
                label="Administration"
                onClick={closeMenu}
                icon={<SettingsIcon />}
              />
            )}

            {userRole === "HR" && (
              <MobileNavLink
                href="/hr"
                label="People Management"
                onClick={closeMenu}
                icon={<SettingsIcon />}
              />
            )}
          </div>
        </nav>

        {/* Theme + Contact + Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-2">
            <ThemeToggle />
          </div>

          <MobileNavLink
            href="/profile"
            label="Profile"
            onClick={closeMenu}
            icon={<ProfileIcon />}
          />

          <MobileNavLink
            href="/contact"
            label={userRole === "EMPLOYEE" ? "Contact Us" : "Contact Support"}
            onClick={closeMenu}
            icon={<ContactIcon />}
          />

          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

type MobileNavLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function MobileNavLink({ href, label, icon, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {icon}
      {label}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function MenuIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

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

function ContactIcon() {
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
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
