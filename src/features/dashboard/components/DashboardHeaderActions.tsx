"use client";

import { usePathname } from "next/navigation";

import LogoutButton from "@/features/auth/components/LogoutButton";

export default function DashboardHeaderActions() {
  const pathname = usePathname();

  const isNewExpensePage = pathname === "/expenses/new";

  if (isNewExpensePage) {
    return null;
  }

  return <LogoutButton />;
}
