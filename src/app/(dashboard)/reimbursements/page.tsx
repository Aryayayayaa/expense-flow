import { redirect } from "next/navigation";

import { auth } from "@/auth";

import Pagination from "@/components/common/Pagination";

import ReimbursementHistoryTable from "@/features/expenses/components/ReimbursementHistoryTable";
//import ReimbursementScopeSelector from "@/features/expenses/components/ReimbursementScopeSelector";
import ReimbursementTable from "@/features/expenses/components/ReimbursementTable";

import {
  getApprovedExpensesForHR,
  getReimbursementHistory,
} from "@/features/expenses/lib/expenses";

import type { ReimbursementExpenseScope } from "@/features/expenses/lib/expenses";

type ReimbursementsPageProps = {
  searchParams: Promise<{
    reimbursementScope?: string;
    reimbursementPage?: string;
    reimbursementHistoryPage?: string;
  }>;
};

export default async function ReimbursementsPage({
  searchParams,
}: ReimbursementsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
    redirect("/dashboard");
  }

  const userId = Number(session.user.id);
  const role = session.user.role;

  const params = await searchParams;

  /* ---------------------------------------------------------------------- */
  /* Reimbursement Scope                                                    */
  /* ---------------------------------------------------------------------- */

  const reimbursementScope: ReimbursementExpenseScope =
    role === "ADMIN"
      ? params.reimbursementScope === "OWN" ||
        params.reimbursementScope === "EMPLOYEES" ||
        params.reimbursementScope === "OTHER_ADMINS" ||
        params.reimbursementScope === "HRS"
        ? params.reimbursementScope
        : "EMPLOYEES"
      : params.reimbursementScope === "OWN" ||
          params.reimbursementScope === "EMPLOYEES" ||
          params.reimbursementScope === "OTHER_HRS" ||
          params.reimbursementScope === "ADMINS"
        ? params.reimbursementScope
        : "EMPLOYEES";

  /* ---------------------------------------------------------------------- */
  /* Reimbursement Pagination                                               */
  /* ---------------------------------------------------------------------- */

  const requestedReimbursementPage = Number(params.reimbursementPage ?? "1");

  const reimbursementPage =
    Number.isInteger(requestedReimbursementPage) &&
    requestedReimbursementPage > 0
      ? requestedReimbursementPage
      : 1;

  const requestedReimbursementHistoryPage = Number(
    params.reimbursementHistoryPage ?? "1",
  );

  const reimbursementHistoryPage =
    Number.isInteger(requestedReimbursementHistoryPage) &&
    requestedReimbursementHistoryPage > 0
      ? requestedReimbursementHistoryPage
      : 1;

  const pageSize = 10;

  /* ---------------------------------------------------------------------- */
  /* Data                                                                    */
  /* ---------------------------------------------------------------------- */

  const [approvedExpenses, reimbursementHistory] = await Promise.all([
    getApprovedExpensesForHR(
      userId,
      reimbursementPage,
      pageSize,
      reimbursementScope,
    ),

    getReimbursementHistory(
      reimbursementHistoryPage,
      pageSize,
      userId,
      reimbursementScope,
    ),
  ]);

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* ---------------------------------------------------------------- */}
        {/* Page Header                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-8 border-b border-slate-300 pb-8 dark:border-slate-800">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Reimbursements
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review approved expenses, process reimbursements, and view
            reimbursement history.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Pending Reimbursement Approvals                                  */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Pending Reimbursement Approvals
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review approved expenses that are waiting to be reimbursed. You
              can review the expense proof and approve or reject the
              reimbursement.
            </p>
          </div>

          <ReimbursementTable
            expenses={approvedExpenses.expenses}
            userId={userId}
            userRole={role}
          />

          <Pagination
            page={approvedExpenses.page}
            totalPages={approvedExpenses.totalPages}
            paramName="reimbursementPage"
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Reimbursement History                                             */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Reimbursement History
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review reimbursements that have already been processed, including
              approval and processing details.
            </p>
          </div>

          <ReimbursementHistoryTable expenses={reimbursementHistory.expenses} />

          <Pagination
            page={reimbursementHistory.page}
            totalPages={reimbursementHistory.totalPages}
            paramName="reimbursementHistoryPage"
          />
        </section>
      </div>
    </main>
  );
}
