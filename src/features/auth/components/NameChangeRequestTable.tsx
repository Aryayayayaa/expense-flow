"use client";

import { useState } from "react";

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

export default function NameChangeRequestTable({ requests }: Props) {
  const [items, setItems] = useState(requests);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function handleApprove(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to approve this name change?",
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(id);
    setMessage("");

    try {
      const result = await approveNameChangeRequestAction(id);

      setMessage(result.message);

      if (result.success) {
        setItems((current) => current.filter((request) => request.id !== id));
      }
    } catch (error) {
      console.error("Approve name change request error:", error);
      setMessage("Unable to approve name change request.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: number) {
    const reason = window.prompt(
      "Enter the reason for rejecting this name change request:",
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setMessage("A rejection reason is required.");
      return;
    }

    setProcessingId(id);
    setMessage("");

    try {
      const result = await rejectNameChangeRequestAction(id, reason.trim());

      setMessage(result.message);

      if (result.success) {
        setItems((current) => current.filter((request) => request.id !== id));
      }
    } catch (error) {
      console.error("Reject name change request error:", error);
      setMessage("Unable to reject name change request.");
    } finally {
      setProcessingId(null);
    }
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
    <div>
      {message && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

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
                                "Name change proof view error:",
                                error,
                              );
                              setMessage("Unable to open proof.");
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
                          onClick={() => handleApprove(request.id)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processing ? "Processing..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleReject(request.id)}
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
    </div>
  );
}
