"use client";

import { useState } from "react";

import AppDialog from "@/components/common/AppDialog";

import {
  approveNameChangeRequestAction,
  rejectNameChangeRequestAction,
} from "../actions/account-actions";

import type { Role, NameChangeRequestStatus } from "@prisma/client";

type NameChangeRequest = {
  id: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl: string | null;
  proofPath: string | null;
  status: NameChangeRequestStatus;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type Props = {
  requests: NameChangeRequest[];
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

export default function NameChangeRequestTable({ requests }: Props) {
  const [items, setItems] = useState(requests);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleApprove(id: number) {
    if (processingId !== null) {
      return;
    }

    setProcessingId(id);

    try {
      const result = await approveNameChangeRequestAction(id);

      if (!result.success) {
        setDialog({
          type: "error",
          message: result.message,
        });

        return;
      }

      setItems((current) => current.filter((request) => request.id !== id));

      setDialog(null);
    } catch (error) {
      console.error("Approve name change request error:", error);

      setDialog({
        type: "error",
        message: "Unable to approve name change request.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: number) {
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

    setProcessingId(id);

    try {
      const result = await rejectNameChangeRequestAction(id, reason);

      if (!result.success) {
        setDialog({
          type: "error",
          message: result.message,
        });

        return;
      }

      setItems((current) => current.filter((request) => request.id !== id));

      setDialog(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Reject name change request error:", error);

      setDialog({
        type: "error",
        message: "Unable to reject name change request.",
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No pending name change requests.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-500">
                  Employee
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Current Name
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Requested Name
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">Reason</th>

                <th className="px-5 py-4 font-medium text-slate-500">Proof</th>

                <th className="px-5 py-4 text-right font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((request) => {
                const processing = processingId === request.id;

                return (
                  <tr key={request.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {request.user.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {request.user.email}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {request.currentName}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {request.requestedName}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-slate-600">
                      {request.reason}
                    </td>

                    <td className="px-5 py-4">
                      {request.proofPath ? (
                        <button
                          type="button"
                          disabled={processing}
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/name-change/${request.id}/proof`,
                              );

                              const data = await response.json();

                              if (!response.ok || !data.url) {
                                setDialog({
                                  type: "error",
                                  message:
                                    data.error ?? "Unable to open proof.",
                                });

                                return;
                              }

                              window.open(
                                data.url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            } catch (error) {
                              console.error(
                                "Name change proof view error:",
                                error,
                              );

                              setDialog({
                                type: "error",
                                message: "Unable to open proof.",
                              });
                            }
                          }}
                          className="font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          View proof
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Optional / none
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() =>
                            setDialog({
                              type: "approve",
                              requestId: request.id,
                            })
                          }
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processing ? "Processing..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={processing}
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AppDialog
        open={dialog?.type === "approve"}
        title="Approve Name Change"
        description="Are you sure you want to approve this name change request?"
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
        title="Reject Name Change"
        description="Please provide a reason for rejecting this name change request."
        variant="danger"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        requiresReason
        reason={rejectionReason}
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Enter the reason for rejecting this name change request..."
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
