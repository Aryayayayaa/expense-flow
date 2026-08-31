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
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No reviewed name change requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">Employee</th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Current Name
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Requested Name
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">Reason</th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">Status</th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Rejection Reason
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Reviewed By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">Reviewed</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {requests.map((request) => {
              const statusClass =
                request.status === "APPROVED"
                  ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300";

              return (
                <tr key={request.id}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {request.user.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {request.user.email}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {request.currentName}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {request.requestedName}
                  </td>

                  <td className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-300">
                    {request.reason}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-300">
                    {request.rejectionReason ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    {request.reviewedBy ? (
                      <>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {request.reviewedBy.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {request.reviewedBy.email}
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
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
