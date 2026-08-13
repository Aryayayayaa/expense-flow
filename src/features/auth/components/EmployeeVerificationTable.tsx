"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";

import {
  approveEmployeeVerificationAction,
  rejectEmployeeVerificationAction,
} from "../actions/employee-verification-actions";

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

  async function handleApprove(id: number) {
    setProcessingId(id);
    setMessage("");

    const result = await approveEmployeeVerificationAction(id);

    setMessage(result.message);

    if (result.success) {
      setItems((current) => current.filter((request) => request.id !== id));
    }

    setProcessingId(null);
  }

  async function handleReject(id: number) {
    const reason = window.prompt("Enter the reason for rejection:");

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setMessage("A rejection reason is required.");
      return;
    }

    setProcessingId(id);
    setMessage("");

    const result = await rejectEmployeeVerificationAction(id, reason);

    setMessage(result.message);

    if (result.success) {
      setItems((current) => current.filter((request) => request.id !== id));
    }

    setProcessingId(null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No pending employee verification requests.
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
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-500">
                  Employee
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">Email</th>

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
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {request.user.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {request.user.email}
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
                          className="font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
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
