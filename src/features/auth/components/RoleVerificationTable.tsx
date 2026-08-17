"use client";

import { useState } from "react";

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

export default function RoleVerificationTable({
  requests,
  canReview,
}: RoleVerificationTableProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function handleApprove(requestId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to approve this role request?",
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(requestId);

    try {
      const result = await approveRoleRequestAction(requestId);

      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error("Approve role request error:", error);
      alert("Unable to approve role request.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId: number) {
    const reason = window.prompt(
      "Enter the reason for rejecting this role request:",
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    setProcessingId(requestId);

    try {
      const result = await rejectRoleRequestAction(requestId, reason.trim());

      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error("Reject role request error:", error);
      alert("Unable to reject role request.");
    } finally {
      setProcessingId(null);
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          No pending requests
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          There are currently no role verification requests waiting for review.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Employee
              </th>

              <th className="px-6 py-4 font-semibold text-slate-700">
                Requested Role
              </th>

              <th className="px-6 py-4 font-semibold text-slate-700">
                Submitted
              </th>

              <th className="px-6 py-4 font-semibold text-slate-700">Proof</th>

              {canReview && (
                <th className="px-5 py-4 text-right font-medium text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {requests.map((request) => {
              const isProcessing = processingId === request.id;

              return (
                <tr key={request.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {request.user.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {request.user.email}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {request.requestedRole}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {request.createdAt.toLocaleDateString("en-GB", {
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
                              alert(
                                data.error ??
                                  "Unable to open verification proof.",
                              );
                              return;
                            }

                            window.open(data.url, "_blank");
                          } catch (error) {
                            console.error("Proof view error:", error);
                            alert("Unable to open verification proof.");
                          }
                        }}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        View Proof
                      </button>
                    ) : (
                      <span className="text-sm text-red-600">No proof</span>
                    )}
                  </td>

                  {canReview && (
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(request.id)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? "Processing..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleReject(request.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
