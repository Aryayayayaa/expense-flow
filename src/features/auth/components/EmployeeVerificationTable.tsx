"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";

import {
  approveEmployeeVerificationAction,
  rejectEmployeeVerificationAction,
} from "../actions/employee-verification-actions";

import AppDialog from "@/components/common/AppDialog";

type EmployeeVerificationRequest = {
  id: number;
  proofUrl: string | null;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type Props = {
  requests: EmployeeVerificationRequest[];
};

export default function EmployeeVerificationTable({ requests }: Props) {
  const [items, setItems] = useState(requests);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleApprove(id: number) {
    setProcessingId(id);
    setMessage("");

    try {
      const result = await approveEmployeeVerificationAction(id);

      setMessage(result.message);

      if (result.success) {
        setItems((current) => current.filter((request) => request.id !== id));
      }
    } catch (error) {
      console.error("Approve employee verification error:", error);
      setMessage("Unable to approve employee verification request.");
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectDialog(id: number) {
    setRejectRequestId(id);
    setRejectionReason("");
    setMessage("");
    setRejectDialogOpen(true);
  }

  function closeRejectDialog() {
    if (processingId !== null) {
      return;
    }

    setRejectDialogOpen(false);
    setRejectRequestId(null);
    setRejectionReason("");
  }

  async function handleReject() {
    if (rejectRequestId === null) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      return;
    }

    setProcessingId(rejectRequestId);
    setMessage("");

    try {
      const result = await rejectEmployeeVerificationAction(
        rejectRequestId,
        reason,
      );

      setMessage(result.message);

      if (result.success) {
        setItems((current) =>
          current.filter((request) => request.id !== rejectRequestId),
        );

        setRejectDialogOpen(false);
        setRejectRequestId(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Reject employee verification error:", error);
      setMessage("Unable to reject employee verification request.");
    } finally {
      setProcessingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No pending employee verification requests.
        </p>

        <AppDialog
          open={rejectDialogOpen}
          onCancel={closeRejectDialog}
          title="Reject Employee Verification"
          description="Enter a reason for rejecting this employee verification request."
          confirmLabel="Reject"
          cancelLabel="Cancel"
          onConfirm={handleReject}
          variant="danger"
          loading={processingId !== null}
          loadingLabel="Rejecting..."
          requiresReason
          reason={rejectionReason}
          reasonLabel="Rejection Reason"
          reasonPlaceholder="Enter the reason for rejection..."
          onReasonChange={setRejectionReason}
        />
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                  Employee
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                  Email
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                  Submitted
                </th>

                <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                  Proof
                </th>

                <th className="px-5 py-4 text-right font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((request) => {
                const processing = processingId === request.id;

                return (
                  <tr key={request.id}>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {request.user.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {request.user.email}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(request.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4">
                      {request.proofUrl ? (
                        <button
                          type="button"
                          disabled={processing}
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/employee-verification/upload/${request.id}/proof`,
                              );

                              const data = await response.json();

                              if (!response.ok || !data.url) {
                                setMessage(
                                  data.error ?? "Unable to open proof.",
                                );
                                return;
                              }

                              window.open(
                                data.url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            } catch (error) {
                              console.error(
                                "Employee verification proof view error:",
                                error,
                              );

                              setMessage("Unable to open proof.");
                            }
                          }}
                          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                        >
                          View proof
                        </button>
                      ) : (
                        <span className="text-slate-400">No proof</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleApprove(request.id)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processing ? "Processing..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => openRejectDialog(request.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AppDialog
        open={rejectDialogOpen}
        onCancel={closeRejectDialog}
        title="Reject Employee Verification"
        description="Enter a reason for rejecting this employee verification request."
        confirmLabel="Reject"
        cancelLabel="Cancel"
        onConfirm={handleReject}
        variant="danger"
        loading={processingId !== null}
        loadingLabel="Rejecting..."
        requiresReason
        reason={rejectionReason}
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Enter the reason for rejection..."
        onReasonChange={setRejectionReason}
      />
    </div>
  );
}
