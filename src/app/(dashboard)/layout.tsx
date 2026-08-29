import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

import MobileSidebar from "@/features/dashboard/components/MobileSidebar";
import Sidebar from "@/features/dashboard/components/Sidebar";
import NotificationBell from "@/features/notifications/components/NotificationBell";

import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/features/notifications/lib/notifications";
import { getDashboardData } from "@/features/dashboard/lib/getDashboardData";

import UserProvider from "@/context/UserProvider";
import type { CurrencyCode } from "@/constants/currencies";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    select: {
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    redirect("/account-disabled");
  }
  const data = await getDashboardData();

  const [notifications, unreadNotificationCount] = await Promise.all([
    getNotifications(data.user.id, 20),
    getUnreadNotificationCount(data.user.id),
  ]);

  return (
    <UserProvider
      defaultCurrency={(session.user.defaultCurrency ?? "INR") as CurrencyCode}
    >
      <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <MobileSidebar
          userName={session?.user?.name}
          userRole={session?.user?.role}
        />

        <div className="flex min-h-screen">
          <Sidebar userRole={session?.user?.role} />

          <div className="min-w-0 flex-1">
            <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400"></p>
              </div>

              <div className="flex items-center gap-4">
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadNotificationCount}
                  userId={Number(session.user.id)}
                  userRole={session.user.role}
                />

                <Link
                  href="/help"
                  aria-label="Help and application information"
                  title="Help and application information"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <HelpIcon />
                </Link>

                <Link
                  href="/profile"
                  aria-label="Profile"
                  title="Profile"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 transition hover:ring-2 hover:ring-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:hover:ring-blue-700"
                >
                  {data.user.name.charAt(0).toUpperCase()}
                </Link>
              </div>
            </header>

            {children}
          </div>
        </div>
      </main>
    </UserProvider>
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
