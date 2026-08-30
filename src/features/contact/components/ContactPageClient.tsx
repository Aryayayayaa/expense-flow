"use client";

import { useState } from "react";

import SupportRequestForm from "./SupportRequestForm";
import SupportRequestHistoryTable, {
  type SupportRequestHistoryRow,
} from "./SupportRequestHistoryTable";
import SupportRequestTable, {
  type SupportRequestRow,
} from "./SupportRequestTable";

type ContactPageClientProps = {
  role: "EMPLOYEE" | "ADMIN" | "HR";
  requests: SupportRequestRow[];
  historyRequests: SupportRequestHistoryRow[];
};

export default function ContactPageClient({
  role,
  requests,
  historyRequests,
}: ContactPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);

  const isEmployee = role === "EMPLOYEE";

  return (
    <div className="space-y-6 sm:space-y-8">
      {isEmployee && (
        <div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            + Add Support Request
          </button>
        </div>
      )}

      {isEmployee && formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-4 dark:bg-slate-900 sm:max-h-[90vh] sm:p-5">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            <SupportRequestForm />
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
          Support Requests
        </h2>

        <SupportRequestTable
          requests={requests}
          canUpdateStatus={role === "ADMIN" || role === "HR"}
        />
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
          Support Request History
        </h2>

        <SupportRequestHistoryTable requests={historyRequests} />
      </section>
    </div>
  );
}
