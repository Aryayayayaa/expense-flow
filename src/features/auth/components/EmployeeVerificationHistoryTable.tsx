import type { EmployeeVerificationStatus, Role } from "@prisma/client";

type EmployeeVerificationHistoryRequest = {
  id: number;
  status: EmployeeVerificationStatus;
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
  requests: EmployeeVerificationHistoryRequest[];
};

export default function EmployeeVerificationHistoryTable({ requests }: Props) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No employee verification history available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <tr>
              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Employee
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Submitted
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Status
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Reviewed By
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Reviewed On
              </th>

              <th className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                Reason
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {requests.map((request) => {
              const approved = request.status === "APPROVED";

              return (
                <tr key={request.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {request.user.name}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {request.user.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
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
                          ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {request.reviewedBy?.name ?? "Unknown"}
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
                      : "-"}
                  </td>

                  <td className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-300">
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
