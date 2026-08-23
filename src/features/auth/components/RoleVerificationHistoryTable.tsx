import type { Role, RoleRequestStatus } from "@prisma/client";

type RoleVerificationHistoryRequest = {
  id: number;
  requestedRole: Role;
  status: RoleRequestStatus;
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
  requests: RoleVerificationHistoryRequest[];
};

export default function RoleVerificationHistoryTable({ requests }: Props) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No role verification history available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500">Employee</th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Requested Role
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Submitted
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">Status</th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Reviewed By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">
                Reviewed On
              </th>

              <th className="px-5 py-4 font-medium text-slate-500">Reason</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => {
              const approved = request.status === "APPROVED";

              return (
                <tr key={request.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {request.user.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {request.user.email}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {request.requestedRole}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {new Date(request.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        approved
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {request.reviewedBy?.name ?? "Unknown"}
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
                      : "-"}
                  </td>

                  <td className="max-w-xs px-5 py-4 text-slate-600">
                    {request.rejectionReason ?? "-"}
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
