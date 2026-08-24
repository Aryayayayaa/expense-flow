"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";

import AppDialog from "@/components/common/AppDialog";

import {
  approveRoleRequestAction,
  rejectRoleRequestAction,
} from "@/features/auth/actions/role-request-actions";

type RoleRequest = {
  id: number;
  requestedRole: Role;
  proofUrl: string | null;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
};

type RoleRequestManagementProps = {
  requests: RoleRequest[];
};

export default function RoleRequestManagement({
  requests,
}: RoleRequestManagementProps) {
  const [items, setItems] = useState(requests);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleApprove(requestId: number) {
    setProcessingId(requestId);
    setMessage("");

    try {
      const result = await approveRoleRequestAction(requestId);

      setMessage(result.message);

      if (result.success) {
        setItems((current) =>
          current.filter((request) => request.id !== requestId),
        );
      }
    } catch (error) {
      console.error("Approve role request error:", error);

      setMessage("Unable to approve the role request.");
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectDialog(requestId: number) {
    setRejectRequestId(requestId);
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
      const result = await rejectRoleRequestAction(rejectRequestId, reason);

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
      console.error("Reject role request error:", error);

      setMessage("Unable to reject the role request.");
    } finally {
      setProcessingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No pending role verification requests.
        </p>

        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

        <AppDialog
          open={rejectDialogOpen}
          onCancel={closeRejectDialog}
          title="Reject Role Request"
          description="Enter a reason for rejecting this role verification request."
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-500">User</th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Requested Role
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Current Role
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">
                  Submitted
                </th>

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
                      <p className="font-medium text-slate-900">
                        {request.user.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {request.user.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <RoleBadge role={request.requestedRole} />
                    </td>

                    <td className="px-5 py-4">
                      <RoleBadge role={request.user.role} />
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {new Date(request.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4">
                      {request.proofUrl ? (
                        <a
                          href={request.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          View proof
                        </a>
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
        title="Reject Role Request"
        description="Enter a reason for rejecting this role verification request."
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

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {role}
    </span>
  );
}
