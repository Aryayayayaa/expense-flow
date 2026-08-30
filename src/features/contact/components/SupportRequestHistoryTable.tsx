"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import type { SupportRequestRow } from "./SupportRequestTable";
import DateFilter from "@/features/expenses/components/DateFilter";

export type SupportRequestHistoryRow = SupportRequestRow & {
  resolvedByUser?: {
    name: string | null;
    email: string | null;
  } | null;
  actionTaken?: string | null;
  resolvedAt?: Date | string | null;
};

type SupportRequestHistoryTableProps = {
  requests: SupportRequestHistoryRow[];
};

export default function SupportRequestHistoryTable({
  requests,
}: SupportRequestHistoryTableProps) {
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const oldestRequestDate =
    requests.length > 0
      ? requests.reduce((oldest, request) =>
          new Date(request.createdAt) < new Date(oldest.createdAt)
            ? request
            : oldest,
        ).createdAt
      : today;

  const minDate = new Date(oldestRequestDate).toISOString().split("T")[0];
  const maxDate = today;

  const filteredRequests = requests.filter((request) => {
    const date = new Date(request.resolvedAt ?? request.updatedAt);

    switch (dateFilter) {
      case "today":
        return date.toDateString() === new Date().toDateString();

      case "yesterday": {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
      }

      case "last-7-days": {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return date >= start;
      }

      case "last-30-days": {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return date >= start;
      }

      case "this-month": {
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      case "last-month": {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return date >= lastMonth && date < nextMonth;
      }

      case "this-year":
        return date.getFullYear() === new Date().getFullYear();

      case "custom":
        if (!customStartDate && !customEndDate) return true;

        if (customStartDate) {
          const start = new Date(`${customStartDate}T00:00:00`);
          if (date < start) return false;
        }

        if (customEndDate) {
          const end = new Date(`${customEndDate}T23:59:59`);
          if (date > end) return false;
        }

        return true;

      default:
        return true;
    }
  });

  const [selectedRequest, setSelectedRequest] =
    useState<SupportRequestHistoryRow | null>(null);

  return (
    <div className="w-full overflow-x-auto rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="w-full p-4">
        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          startDate={customStartDate}
          endDate={customEndDate}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
      <table className="w-full min-w-[1100px] text-left text-xs">
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

            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              Resolved By
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              Action Taken
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
              Closed On
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
              >
                No closed support requests found.
              </td>
            </tr>
          ) : (
            filteredRequests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
              >
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {request.category}
                </td>

                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {request.subject}
                </td>

                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>

                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  Resolved
                </td>

                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {request.resolvedByUser?.name ?? "—"}
                </td>

                <td className="max-w-[250px] px-4 py-3 text-slate-600 dark:text-slate-300">
                  {request.actionTaken ?? "—"}
                </td>

                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {request.resolvedAt
                    ? new Date(request.resolvedAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Support Request
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Request #{selectedRequest.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Employee
                </p>
                <p className="mt-1 text-slate-900 dark:text-slate-100">
                  {selectedRequest.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedRequest.user?.email ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Category
                </p>
                <p className="mt-1 text-slate-900 dark:text-slate-100">
                  {selectedRequest.category
                    .replace(/[-_]+/g, " ")
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Subject
                </p>
                <p className="mt-1 text-slate-900 dark:text-slate-100">
                  {selectedRequest.subject}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Message
                </p>
                <div className="mt-1 max-h-40 overflow-y-auto rounded-md bg-slate-50 p-3 whitespace-pre-wrap text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedRequest.message}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Action Taken
                </p>
                <div className="mt-1 rounded-md bg-slate-50 p-3 whitespace-pre-wrap text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedRequest.actionTaken ?? "—"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Resolved By
                  </p>
                  <p className="mt-1 text-slate-900 dark:text-slate-100">
                    {selectedRequest.resolvedByUser?.name ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Closed On
                  </p>
                  <p className="mt-1 text-slate-900 dark:text-slate-100">
                    {selectedRequest.resolvedAt
                      ? new Date(selectedRequest.resolvedAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
