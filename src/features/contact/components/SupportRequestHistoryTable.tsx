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
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
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
      <table className="w-full min-w-[1100px] text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Category</th>

            <th className="px-4 py-3 font-semibold text-slate-700">Subject</th>

            <th className="px-4 py-3 font-semibold text-slate-700">
              Created On
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700">View</th>

            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>

            <th className="px-4 py-3 font-semibold text-slate-700">
              Resolved By
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700">
              Action Taken
            </th>

            <th className="px-4 py-3 font-semibold text-slate-700">
              Closed On
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                No closed support requests found.
              </td>
            </tr>
          ) : (
            filteredRequests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="px-4 py-3 text-slate-700">{request.category}</td>

                <td className="px-4 py-3 font-medium text-slate-900">
                  {request.subject}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>

                <td className="px-4 py-3 font-medium text-slate-700">Closed</td>

                <td className="px-4 py-3 text-slate-700">
                  {request.resolvedByUser?.name ?? "—"}
                </td>

                <td className="max-w-[250px] px-4 py-3 text-slate-600">
                  {request.actionTaken ?? "—"}
                </td>

                <td className="px-4 py-3 text-slate-600">
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
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Support Request
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Request #{selectedRequest.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-500">Employee</p>
                <p className="mt-1 text-slate-900">
                  {selectedRequest.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedRequest.user?.email ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Category</p>
                <p className="mt-1 text-slate-900">
                  {selectedRequest.category
                    .replace(/[-_]+/g, " ")
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Subject</p>
                <p className="mt-1 text-slate-900">{selectedRequest.subject}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Message</p>
                <div className="mt-1 max-h-40 overflow-y-auto rounded-md bg-slate-50 p-3 whitespace-pre-wrap text-slate-700">
                  {selectedRequest.message}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Action Taken
                </p>
                <div className="mt-1 rounded-md bg-slate-50 p-3 whitespace-pre-wrap text-slate-700">
                  {selectedRequest.actionTaken ?? "—"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Resolved By
                  </p>
                  <p className="mt-1 text-slate-900">
                    {selectedRequest.resolvedByUser?.name ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Closed On
                  </p>
                  <p className="mt-1 text-slate-900">
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
