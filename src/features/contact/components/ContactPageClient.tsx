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
    <div className="space-y-8">
      {isEmployee && (
        <div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + Add Support Request
          </button>
        </div>
      )}

      {isEmployee && formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-5">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <SupportRequestForm />
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Support Requests
        </h2>

        <SupportRequestTable
          requests={requests}
          canUpdateStatus={role === "ADMIN" || role === "HR"}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Support Request History
        </h2>

        <SupportRequestHistoryTable requests={historyRequests} />
      </section>
    </div>
  );
}
