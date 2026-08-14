import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { getPendingEmployeeVerificationRequests } from "@/features/auth/lib/employee-verification";

import EmployeeVerificationTable from "@/features/auth/components/EmployeeVerificationTable";
import ReimbursementHistoryTable from "@/features/expenses/components/ReimbursementHistoryTable";

import {
  getApprovedExpensesForHR,
  getReimbursementHistory,
} from "@/features/expenses/lib/expenses";

import ReimbursementTable from "@/features/expenses/components/ReimbursementTable";

export default async function HrPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "HR") {
    redirect("/dashboard");
  }

  const [requests, approvedExpenses, reimbursementHistory] = await Promise.all([
    getPendingEmployeeVerificationRequests(),
    getApprovedExpensesForHR(Number(session.user.id)),
    getReimbursementHistory(),
  ]);

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            HR Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage employee verification and process approved expense
            reimbursements.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Employee Verification                                            */}
        {/* ---------------------------------------------------------------- */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Employee Verification
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review employee identity and employment verification documents.
            </p>
          </div>

          <EmployeeVerificationTable requests={requests} />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Reimbursement Queue                                              */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Expense Reimbursements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review expenses approved by Admin and manually mark them as
              reimbursed.
            </p>
          </div>

          <ReimbursementTable expenses={approvedExpenses} />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Reimbursement History                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Reimbursement History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review expenses that have already been reimbursed, including who
              approved and who processed the reimbursement.
            </p>
          </div>

          <ReimbursementHistoryTable expenses={reimbursementHistory.expenses} />
        </section>
      </div>
    </main>
  );
}
