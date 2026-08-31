"use client";

import { useState } from "react";

import AppDialog from "@/components/common/AppDialog";

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

type DialogState =
  | {
      type: "toggle";
      user: User;
    }
  | {
      type: "error";
      message: string;
    }
  | null;

export default function UserManagementTable({ users }: Props) {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

  async function handleToggle(user: User) {
    if (processingId !== null) {
      return;
    }

    setProcessingId(user.id);

    try {
      const result = user.isActive
        ? await deactivateAccountAction(user.id)
        : await activateAccountAction(user.id);

      if (!result.success) {
        setDialog({
          type: "error",
          message: result.message,
        });

        return;
      }

      setDialog(null);
    } catch (error) {
      console.error("Account status update error:", error);

      setDialog({
        type: "error",
        message: "Unable to update account status.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  function closeDialog() {
    if (processingId !== null) {
      return;
    }

    setDialog(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  Name
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  Email
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  Role
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  Status
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  Joined
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => {
                const isProcessing = processingId === user.id;

                return (
                  <tr key={user.id}>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge isActive={user.isActive} />
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {user.createdAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4">
                      {user.role === "ADMIN" ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            setDialog({
                              type: "toggle",
                              user,
                            })
                          }
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
                    className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AppDialog
        open={dialog?.type === "toggle"}
        title={
          dialog?.type === "toggle"
            ? dialog.user.isActive
              ? "Deactivate Account"
              : "Reactivate Account"
            : "Account Action"
        }
        description={
          dialog?.type === "toggle"
            ? `Are you sure you want to ${
                dialog.user.isActive ? "deactivate" : "reactivate"
              } ${dialog.user.name}'s account?`
            : undefined
        }
        variant={
          dialog?.type === "toggle" && dialog.user.isActive
            ? "danger"
            : "success"
        }
        confirmLabel={
          dialog?.type === "toggle"
            ? dialog.user.isActive
              ? "Deactivate"
              : "Reactivate"
            : "Confirm"
        }
        cancelLabel="Cancel"
        loading={processingId !== null}
        loadingLabel="Processing..."
        onConfirm={() => {
          if (dialog?.type === "toggle") {
            void handleToggle(dialog.user);
          }
        }}
        onCancel={closeDialog}
      />

      <AppDialog
        open={dialog?.type === "error"}
        title="Unable to Complete Action"
        description={dialog?.type === "error" ? dialog.message : undefined}
        variant="error"
        confirmLabel="Close"
        showCancel={false}
        onConfirm={closeDialog}
        onCancel={closeDialog}
      />
    </>
  );
}

function RoleBadge({ role }: { role: "ADMIN" | "HR" | "EMPLOYEE" }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {role}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
