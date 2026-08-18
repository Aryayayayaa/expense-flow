import { redirect } from "next/navigation";

import { auth } from "@/auth";

import {
  getEmployeeVerificationHistory,
  getPendingEmployeeVerificationRequests,
} from "@/features/auth/lib/employee-verification";

import EmployeeVerificationTable from "@/features/auth/components/EmployeeVerificationTable";
import ReimbursementHistoryTable from "@/features/expenses/components/ReimbursementHistoryTable";
import HrManagementSelector from "@/features/auth/components/HrManagementSelector";
import NameChangeRequestHistoryTable from "@/features/auth/components/NameChangeRequestHistoryTable";

import { getNameChangeRequestHistory } from "@/features/auth/lib/name-change-requests";
import {
  getApprovedExpensesForHR,
  getReimbursementHistory,
} from "@/features/expenses/lib/expenses";

import ReimbursementTable from "@/features/expenses/components/ReimbursementTable";
import EmployeeVerificationHistoryTable from "@/features/auth/components/EmployeeVerificationHistoryTable";

import { getPendingNameChangeRequests } from "@/features/auth/lib/name-change-requests";
import NameChangeRequestTable from "@/features/auth/components/NameChangeRequestTable";

export default async function HrPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "HR") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const section =
    params.section === "reimbursement" || params.section === "name-change"
      ? params.section
      : "verification";

  const hrId = Number(session.user.id);

  const [
    requests,
    employeeVerificationHistory,
    approvedExpenses,
    reimbursementHistory,
    nameChangeRequests,
    nameChangeRequestHistory,
  ] = await Promise.all([
    getPendingEmployeeVerificationRequests(),
    getEmployeeVerificationHistory(),
    getApprovedExpensesForHR(hrId),
    getReimbursementHistory(),
    getPendingNameChangeRequests(),
    getNameChangeRequestHistory(),
  ]);

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            HR Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage employee verification and process approved expense
            reimbursements.
          </p>

          <HrManagementSelector section={section} />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Employee Verification                                            */}
        {/* ---------------------------------------------------------------- */}

        {section === "verification" && (
          <>
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Employee Verification
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review employee identity and employment verification
                  documents.
                </p>
              </div>

              <EmployeeVerificationTable requests={requests} />
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Employee Verification History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review previously approved and rejected employee verification
                  requests.
                </p>
              </div>

              <EmployeeVerificationHistoryTable
                requests={employeeVerificationHistory}
              />
            </section>
          </>
        )}

        {section === "reimbursement" && (
          <>
            {/* ---------------------------------------------------------------- */}
            {/* Reimbursement Queue                                              */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
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
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Reimbursement History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review expenses that have already been reimbursed, including
                  who approved and who processed the reimbursement.
                </p>
              </div>

              <ReimbursementHistoryTable
                expenses={reimbursementHistory.expenses}
              />
            </section>
          </>
        )}

        {section === "name-change" && (
          <>
            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Name Change Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review employee requests to change their account name.
                </p>
              </div>

              <NameChangeRequestTable requests={nameChangeRequests} />
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Name Change Request History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review previously approved and rejected name change requests.
                </p>
              </div>

              <NameChangeRequestHistoryTable
                requests={nameChangeRequestHistory}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
