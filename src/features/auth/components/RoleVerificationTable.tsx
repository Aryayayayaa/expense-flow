"use client";

import { useState } from "react";

import AppDialog from "@/components/common/AppDialog";

import {
  approveRoleRequestAction,
  rejectRoleRequestAction,
} from "../actions/role-request-actions";

import type { Role, RoleRequestStatus } from "@prisma/client";

type RoleVerificationRequest = {
  id: number;
  requestedRole: Role;
  status: RoleRequestStatus;
  createdAt: Date;
  proofUrl: string | null;
  proofPath: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type RoleVerificationTableProps = {
  requests: RoleVerificationRequest[];
  canReview: boolean;
};

type DialogState =
  | {
      type: "approve";
      requestId: number;
    }
  | {
      type: "reject";
      requestId: number;
    }
  | {
      type: "error";
      message: string;
    }
  | null;

export default function RoleVerificationTable({
  requests,
  canReview,
}: RoleVerificationTableProps) {
  const [items, setItems] = useState(requests);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleApprove(requestId: number) {
    if (processingId !== null) {
      return;
    }

    setProcessingId(requestId);

    try {
      const result = await approveRoleRequestAction(requestId);

      if (!result.success) {
        setDialog({
          type: "error",
          message: result.message,
        });

        return;
      }

      setItems((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "APPROVED",
              }
            : request,
        ),
      );

      setDialog(null);
    } catch (error) {
      console.error("Approve role request error:", error);

      setDialog({
        type: "error",
        message: "Unable to approve role request.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId: number) {
    const reason = rejectionReason.trim();

    if (!reason) {
      setDialog({
        type: "error",
        message: "A rejection reason is required.",
      });

      return;
    }

    if (processingId !== null) {
      return;
    }

    setProcessingId(requestId);

    try {
      const result = await rejectRoleRequestAction(requestId, reason);

      if (!result.success) {
        setDialog({
          type: "error",
          message: result.message,
        });

        return;
      }

      setItems((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "REJECTED",
              }
            : request,
        ),
      );

      setDialog(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Reject role request error:", error);

      setDialog({
        type: "error",
        message: "Unable to reject role request.",
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
    setRejectionReason("");
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          No role verification requests
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          There are currently no role verification requests.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                  Employee
                </th>

                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                  Requested Role
                </th>

                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>

                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                  Submitted
                </th>

                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                  Proof
                </th>

                {canReview && (
                  <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.map((request) => {
                const isProcessing = processingId === request.id;
                const isPending = request.status === "PENDING";

                return (
                  <tr key={request.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {request.user.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {request.user.email}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {request.requestedRole}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(request.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4">
                      {request.proofPath ? (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/role-verification/upload/${request.id}/proof`,
                              );

                              const data = await response.json();

                              if (!response.ok) {
                                setDialog({
                                  type: "error",
                                  message:
                                    data.error ??
                                    "Unable to open verification proof.",
                                });

                                return;
                              }

                              window.open(
                                data.url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            } catch (error) {
                              console.error("Proof view error:", error);

                              setDialog({
                                type: "error",
                                message: "Unable to open verification proof.",
                              });
                            }
                          }}
                          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Proof
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">
                          No proof
                        </span>
                      )}
                    </td>

                    {canReview && (
                      <td className="px-6 py-4">
                        {isPending ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                setDialog({
                                  type: "approve",
                                  requestId: request.id,
                                })
                              }
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isProcessing ? "Processing..." : "Approve"}
                            </button>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => {
                                setRejectionReason("");

                                setDialog({
                                  type: "reject",
                                  requestId: request.id,
                                });
                              }}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Reviewed
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AppDialog
        open={dialog?.type === "approve"}
        title="Approve Role Request"
        description="Are you sure you want to approve this role request?"
        variant="success"
        confirmLabel="Approve"
        cancelLabel="Cancel"
        loading={processingId !== null}
        loadingLabel="Processing..."
        onConfirm={() => {
          if (dialog?.type === "approve") {
            void handleApprove(dialog.requestId);
          }
        }}
        onCancel={closeDialog}
      />

      <AppDialog
        open={dialog?.type === "reject"}
        title="Reject Role Request"
        description="Please provide a reason for rejecting this role request."
        variant="danger"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        requiresReason
        reason={rejectionReason}
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Enter the reason for rejecting this role request..."
        onReasonChange={setRejectionReason}
        loading={processingId !== null}
        loadingLabel="Processing..."
        onConfirm={() => {
          if (dialog?.type === "reject") {
            void handleReject(dialog.requestId);
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

function StatusBadge({ status }: { status: RoleRequestStatus }) {
  const classes =
    status === "APPROVED"
      ? "bg-green-50 text-green-700"
      : status === "REJECTED"
        ? "bg-red-50 text-red-700"
        : "bg-yellow-50 text-yellow-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}
