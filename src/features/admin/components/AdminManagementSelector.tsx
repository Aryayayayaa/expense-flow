"use client";

import { useState } from "react";

import UserManagementTable from "./UserManagementTable";
import ReimbursementHistoryTable from "@/features/expenses/components/ReimbursementHistoryTable";

import type { ReimbursementHistoryExpense } from "@/features/expenses/lib/expenses";
import type { Role } from "@prisma/client";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

type Props = {
  users: User[];
  reimbursementExpenses: ReimbursementHistoryExpense[];
};

type ManagementView = "users" | "reimbursements";

export default function AdminManagementSelector({
  users,
  reimbursementExpenses,
}: Props) {
  const [view, setView] = useState<ManagementView>("users");

  return (
    <div className="mt-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label
          htmlFor="admin-management-view"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Management View
        </label>

        <select
          id="admin-management-view"
          value={view}
          onChange={(event) => setView(event.target.value as ManagementView)}
          className="h-12 w-full max-w-sm rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="users">Users</option>
          <option value="reimbursements">Reimbursement History</option>
        </select>
      </div>

      {view === "users" && (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View all registered users and their current roles.
            </p>
          </div>

          <UserManagementTable users={users} />
        </section>
      )}

      {view === "reimbursements" && (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Reimbursement History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review expenses that have been reimbursed, including the Admin who
              approved them and the HR member who processed the reimbursement.
            </p>
          </div>

          <ReimbursementHistoryTable expenses={reimbursementExpenses} />
        </section>
      )}
    </div>
  );
}
