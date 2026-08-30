"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

import SupportRequestStatusFilter from "./SupportRequestStatusFilter";
import SupportRequestDetailsDialog from "./SupportRequestDetailsDialog";
import SupportRequestStatusSelect from "./SupportRequestStatusSelect";

function formatCategory(category: string) {
  return category
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export type SupportRequestRow = {
  id: number;
  category: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    name: string | null;
    email: string | null;
  };
};

type SupportRequestTableProps = {
  requests: SupportRequestRow[];
  canUpdateStatus?: boolean;
};

export default function SupportRequestTable({
  requests,
  canUpdateStatus = false,
}: SupportRequestTableProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] =
    useState<SupportRequestRow | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRequests =
    statusFilter === "ALL"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  return (
    <div className="w-full overflow-x-auto rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="m-2">
        <SupportRequestStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              Category
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              Subject
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              Created On
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              View
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
              >
                No support requests found.
              </td>
            </tr>
          ) : (
            filteredRequests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
              >
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {formatCategory(request.category)}
                </td>

                <td className="px-4 py-3 font-medium text-slate-100">
                  {request.subject}
                </td>

                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>

                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  {canUpdateStatus && mounted ? (
                    <SupportRequestStatusSelect
                      requestId={request.id}
                      currentStatus={request.status}
                    />
                  ) : (
                    formatCategory(request.status)
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <SupportRequestDetailsDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
