"use client";

import { useState } from "react";

import {
  activateAccountAction,
  deactivateAccountAction,
} from "@/features/auth/actions/account-actions";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  isActive: boolean;
  createdAt: Date;
};

type Props = {
  users: User[];
};

export default function UserManagementTable({ users }: Props) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function handleToggle(user: User) {
    const action = user.isActive ? "deactivate" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}'s account?`,
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(user.id);

    try {
      const result = user.isActive
        ? await deactivateAccountAction(user.id)
        : await activateAccountAction(user.id);

      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error("Account status update error:", error);
      alert("Unable to update account status.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500">Name</th>

              <th className="px-5 py-4 font-medium text-slate-500">Email</th>

              <th className="px-5 py-4 font-medium text-slate-500">Role</th>

              <th className="px-5 py-4 font-medium text-slate-500">Status</th>

              <th className="px-5 py-4 font-medium text-slate-500">Joined</th>

              <th className="px-5 py-4 font-medium text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isProcessing = processingId === user.id;

              return (
                <tr key={user.id}>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {user.name}
                  </td>

                  <td className="px-5 py-4 text-slate-600">{user.email}</td>

                  <td className="px-5 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge isActive={user.isActive} />
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {user.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-5 py-4">
                    {user.role === "ADMIN" ? (
                      <span className="text-xs text-slate-400">Protected</span>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleToggle(user)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isProcessing
                          ? "Processing..."
                          : user.isActive
                            ? "Deactivate"
                            : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
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
  );
}

function RoleBadge({ role }: { role: "ADMIN" | "HR" | "EMPLOYEE" }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {role}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
