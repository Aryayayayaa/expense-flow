"use client";

import { X } from "lucide-react";

import type { SupportRequestRow } from "./SupportRequestTable";

type SupportRequestDetailsDialogProps = {
  request: SupportRequestRow | null;
  onClose: () => void;
};

export default function SupportRequestDetailsDialog({
  request,
  onClose,
}: SupportRequestDetailsDialogProps) {
  if (!request) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-request-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2
              id="support-request-details-title"
              className="text-lg font-semibold text-slate-900"
            >
              Support Request #{request.id}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Submitted {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Employee</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {request.user?.name ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Email</p>
              <p className="mt-1 break-all text-sm text-slate-700">
                {request.user?.email ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Category</p>
              <p className="mt-1 text-sm text-slate-700">{request.category}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Status</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {request.status}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">Subject</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {request.subject}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">Message</p>

            <div className="mt-2 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {request.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
