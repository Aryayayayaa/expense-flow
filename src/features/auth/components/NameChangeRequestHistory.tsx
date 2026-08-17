"use client";

import type { NameChangeRequestStatus } from "@prisma/client";

type Request = {
  id: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl: string | null;
  proofPath: string | null;
  status: NameChangeRequestStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  reviewedBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

type Props = {
  requests: Request[];
};

export default function NameChangeRequestHistory({ requests }: Props) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Name Change Request History
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track your previous name change requests and their review status.
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const statusStyles = {
            PENDING: "bg-amber-50 text-amber-700",
            APPROVED: "bg-green-50 text-green-700",
            REJECTED: "bg-red-50 text-red-700",
          };

          return (
            <div
              key={request.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Requested Name</p>

                  <p className="mt-1 font-medium text-slate-900">
                    {request.requestedName}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[request.status]
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">Reason</p>

                <p className="mt-1 text-sm text-slate-700">{request.reason}</p>
              </div>

              {request.proofUrl && (
                <div className="mt-4">
                  <a
                    href={request.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View supporting proof
                  </a>
                </div>
              )}

              {request.status === "REJECTED" && request.rejectionReason && (
                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    Rejection Reason
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {request.rejectionReason}
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-500">
                Submitted{" "}
                {new Date(request.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              {request.reviewedAt && request.reviewedBy && (
                <div className="mt-1 text-xs text-slate-500">
                  Reviewed by {request.reviewedBy.name} on{" "}
                  {new Date(request.reviewedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
