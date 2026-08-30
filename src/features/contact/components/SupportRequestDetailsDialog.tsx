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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm dark:bg-black/70 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-900 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-request-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <div>
            <h2
              id="support-request-details-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Support Request #{request.id}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Submitted {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Employee
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                {request.user?.name ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Email
              </p>
              <p className="mt-1 break-all text-sm text-slate-700">
                {request.user?.email ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Category
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {request.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Status
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {request.status}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Subject
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {request.subject}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Message
            </p>

            <div className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {request.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
