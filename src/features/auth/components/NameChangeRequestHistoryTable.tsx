"use client";

import type { NameChangeRequestStatus, Role } from "@prisma/client";

type NameChangeRequest = {
  id: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl: string | null;
  proofPath: string | null;
  status: NameChangeRequestStatus;
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  reviewedBy: {
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null;
};

type Props = {
  requests: NameChangeRequest[];
};

export default function NameChangeRequestHistoryTable({ requests }: Props) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No reviewed name change requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500">Employee</th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Current Name
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Requested Name
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">Reason</th>

              <th className="px-5 py-4 font-medium text-slate-500">Status</th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Rejection Reason
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Reviewed By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">Reviewed</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => {
              const statusClass =
                request.status === "APPROVED"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700";

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
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="max-w-xs px-5 py-4 text-slate-600">
                    {request.rejectionReason ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    {request.reviewedBy ? (
                      <>
                        <div className="font-medium text-slate-900">
                          {request.reviewedBy.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {request.reviewedBy.email}
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {request.reviewedAt
                      ? new Date(request.reviewedAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
