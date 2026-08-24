import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { CurrencyCode } from "@/constants/currencies";

import {
  getExpenseApprovalHistory,
  getExpenses,
  getPendingExpensesForAdmin,
  getExpenseDeletionHistoryForAdmin,
  getDeletedExpensesForUser,
  type AdminExpenseScope,
} from "@/features/expenses/lib/expenses";

import type {
  ExpenseApprovalStatus,
  ExpenseReimbursementStatus,
} from "@/features/expenses/components/StatusFilters";

import ApprovalStatusFilters from "@/features/approvals/components/ApprovalStatusFilters";

import Pagination from "@/components/common/Pagination";
import ApprovalList from "@/features/approvals/components/ApprovalList";
import ApprovalDeleteHistory from "@/features/approvals/components/ApprovalDeleteHistory";
import ApprovalHistoryTable from "@/features/approvals/components/ApprovalHistoryTable";
import MyExpenseStatusTable from "@/features/approvals/components/MyExpenseStatusTable";

type ApprovalsPageProps = {
  searchParams: Promise<{
    page?: string;
    approvalStatus?: string;
    reimbursementStatus?: string;
    scope?: string;
  }>;
};

export default async function ApprovalsPage({
  searchParams,
}: ApprovalsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const role = session.user.role;
  const defaultCurrency = session.user.defaultCurrency as CurrencyCode;

  /*
   * --------------------------------------------------------------------------
   * ADMIN
   * --------------------------------------------------------------------------
   *
   * Admins can:
   *
   * 1. View their own pending expenses using OWN.
   * 2. Review employee pending expenses using EMPLOYEES.
   * 3. Review HR pending expenses using HRS.
   *
   * Only OWN expenses are allowed to navigate to /expenses/[id].
   *
   * Employee / HR expenses remain inside the Review dialog.
   */
  if (role === "ADMIN") {
    const params = await searchParams;

    const requestedPage = Number(params.page ?? "1");

    const historyPage =
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    const approvalStatus: ExpenseApprovalStatus =
      params.approvalStatus === "PENDING" ||
      params.approvalStatus === "APPROVED" ||
      params.approvalStatus === "REJECTED"
        ? params.approvalStatus
        : "ALL";

    const reimbursementStatus: ExpenseReimbursementStatus =
      params.reimbursementStatus === "PENDING" ||
      params.reimbursementStatus === "REIMBURSED" ||
      params.reimbursementStatus === "REJECTED"
        ? params.reimbursementStatus
        : "ALL";

    /*
     * Default Admin scope:
     *
     * Employees
     *
     * This preserves the purpose of the approval page:
     * reviewing employee expenses.
     */
    const expenseScope: AdminExpenseScope =
      params.scope === "OWN" ||
      params.scope === "EMPLOYEES" ||
      params.scope === "HRS" ||
      params.scope === "OTHER_ADMINS"
        ? params.scope
        : "EMPLOYEES";

    const [pendingExpenses, history, deletionHistory] = await Promise.all([
      getPendingExpensesForAdmin(userId, expenseScope, reimbursementStatus),

      getExpenseApprovalHistory(
        userId,
        expenseScope,
        historyPage,
        10,
        approvalStatus,
        reimbursementStatus,
      ),

      getExpenseDeletionHistoryForAdmin(userId, expenseScope, historyPage, 10),
    ]);

    const serializedPendingExpenses = pendingExpenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),

      baseCurrencyAmount:
        expense.baseCurrencyAmount !== null
          ? Number(expense.baseCurrencyAmount)
          : null,

      exchangeRate:
        expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,

      /*
       * IMPORTANT:
       *
       * Approval/review screens must always display the
       * original expense amount in the original expense currency.
       *
       * The Admin's default currency must not affect this value.
       */
      displayAmount: Number(expense.amount),
    }));

    return (
      <main className="p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              Expense Approvals
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review expenses according to the selected expense scope and track
              previous approval decisions.
            </p>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Pending Approvals                                                */}
          {/* ---------------------------------------------------------------- */}

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Pending Approvals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previously approved and rejected expenses within the selected
                expense scope.
              </p>
            </div>

            {/* Expense Scope */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Expense Scope
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Choose which pending expenses you want to view.
                </p>
              </div>

              <form method="GET" className="flex flex-wrap items-center gap-3">
                <input
                  type="hidden"
                  name="approvalStatus"
                  value={approvalStatus}
                />

                <input
                  type="hidden"
                  name="reimbursementStatus"
                  value={reimbursementStatus}
                />

                <input type="hidden" name="page" value="1" />

                <select
                  name="scope"
                  defaultValue={expenseScope}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="OWN">OWN</option>
                  <option value="EMPLOYEES">Employees</option>
                  <option value="HRS">HRs</option>
                  <option value="OTHER_ADMINS">Other Admins</option>
                </select>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Apply Scope
                </button>
              </form>
            </div>

            <ApprovalList
              expenses={serializedPendingExpenses}
              expenseScope={expenseScope}
              currentUserId={userId}
            />
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Approval History                                                 */}
          {/* ---------------------------------------------------------------- */}

          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Approval History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previously approved and rejected expenses.
              </p>
            </div>

            {/* Approval history filters */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Filter Approval History
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Filter approval history by approval and reimbursement status.
                </p>
              </div>

              <ApprovalStatusFilters
                approvalStatus={approvalStatus}
                reimbursementStatus={reimbursementStatus}
              />
            </div>

            <ApprovalHistoryTable expenses={history.expenses} />

            {/* Approval delete history */}
            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Approval Delete History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Expenses deleted by Admins are preserved here with their
                  deletion reason and owner information for the selected scope.
                </p>
              </div>

              <ApprovalDeleteHistory expenses={deletionHistory.expenses} />
            </section>

            <Pagination page={history.page} totalPages={history.totalPages} />
          </section>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * EMPLOYEE / HR
   * --------------------------------------------------------------------------
   *
   * They cannot approve other users' expenses.
   *
   * They only see their own expenses.
   *
   * Clicking one of their own expenses opens:
   *
   *   /expenses/[id]
   *
   * Edit/Delete are handled there.
   */
  const params = await searchParams;

  const approvalStatus: ExpenseApprovalStatus =
    params.approvalStatus === "PENDING" ||
    params.approvalStatus === "APPROVED" ||
    params.approvalStatus === "REJECTED"
      ? params.approvalStatus
      : "ALL";

  const reimbursementStatus: ExpenseReimbursementStatus =
    params.reimbursementStatus === "PENDING" ||
    params.reimbursementStatus === "REIMBURSED" ||
    params.reimbursementStatus === "REJECTED"
      ? params.reimbursementStatus
      : "ALL";

  const requestedPage = Number(params.page ?? "1");

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const pageSize = 10;

  const expenseResult = await getExpenses(
    userId,
    page,
    pageSize,
    approvalStatus,
    reimbursementStatus,
    defaultCurrency,
  );

  const deletedExpenses = await getDeletedExpensesForUser(userId);

  const expenses = expenseResult.expenses;

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          My Expense Status
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the approval status of your submitted expenses.
        </p>
      </div>

      {/* Employee / HR filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Filter Expense Status
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Filter your expenses by approval and reimbursement status.
          </p>
        </div>

        <ApprovalStatusFilters
          approvalStatus={approvalStatus}
          reimbursementStatus={reimbursementStatus}
        />
      </div>

      <MyExpenseStatusTable expenses={expenses} />

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Deleted Expenses History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Expenses deleted by an Admin that originally belonged to you.
          </p>
        </div>

        <ApprovalDeleteHistory
          expenses={deletedExpenses}
          showEmployee={false}
        />
      </section>

      <Pagination
        page={expenseResult.page}
        totalPages={expenseResult.totalPages}
      />
    </main>
  );
}
