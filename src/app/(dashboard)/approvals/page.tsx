import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { formatCurrency } from "@/utils/formatCurrency";

import {
  getExpenseApprovalHistory,
  getExpenses,
  getPendingExpensesForAdmin,
  getExpenseDeletionHistoryForAdmin,
} from "@/features/expenses/lib/expenses";

import type {
  ExpenseApprovalStatus,
  ExpenseReimbursementStatus,
} from "@/features/expenses/components/StatusFilters";

import ApprovalStatusFilters from "@/features/approvals/components/ApprovalStatusFilters";

import Pagination from "@/components/common/Pagination";
import ApprovalList from "@/features/approvals/components/ApprovalList";
import ApprovalDeleteHistory from "@/features/approvals/components/ApprovalDeleteHistory";

type ApprovalsPageProps = {
  searchParams: Promise<{
    page?: string;
    approvalStatus?: string;
    reimbursementStatus?: string;
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

  /*
   * ADMIN
   * Admins review other users' pending expenses
   * and can view the complete approval history.
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

    const [pendingExpenses, history, deletionHistory] = await Promise.all([
      getPendingExpensesForAdmin(userId),
      getExpenseApprovalHistory(
        historyPage,
        10,
        approvalStatus,
        reimbursementStatus,
      ),
      getExpenseDeletionHistoryForAdmin(),
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
    }));

    return (
      <main className="p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              Expense Approvals
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review employee expenses and track previous approval decisions.
            </p>
          </div>

          {/* Pending approvals */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Pending Approvals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Expenses waiting for your approval.
              </p>
            </div>

            <ApprovalList expenses={serializedPendingExpenses} />
          </section>

          {/* Approval history */}
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

            {/* Approval history table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {history.expenses.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No approval history available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Expense
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Employee
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Amount
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Decision
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Decided By
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Decision Date
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Reason
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {history.expenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {expense.title}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">
                              {expense.user?.name ?? "Unknown"}
                            </div>

                            <div className="text-xs text-slate-500">
                              {expense.user?.email ?? "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-700">
                            {formatCurrency(expense.amount, expense.currency)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                expense.status === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : expense.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {expense.status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">
                              {expense.decidedBy?.name ?? "Unknown"}
                            </div>

                            <div className="text-xs text-slate-500">
                              {expense.decidedBy?.email ?? "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {expense.decidedAt
                              ? expense.decidedAt.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>

                          <td className="max-w-xs px-5 py-4 text-slate-600">
                            {expense.rejectionReason ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Approval delete history */}
            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Approval Delete History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Expenses deleted by Admins are preserved here with their
                  deletion reason and employee information.
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
   * EMPLOYEE / HR
   * They cannot approve expenses.
   * They only see the status of their own expenses.
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
  );

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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            You have not submitted any expenses yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Expense
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Amount
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Category
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Date
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Status
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-700">
                    Decision Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {expense.title}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.category}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.expenseDate
                        ? expense.expenseDate.toLocaleDateString("en-GB")
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          expense.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : expense.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {expense.status}
                      </span>

                      {expense.status === "REJECTED" &&
                        expense.rejectionReason && (
                          <p className="mt-1 max-w-xs text-xs text-red-600">
                            {expense.rejectionReason}
                          </p>
                        )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {expense.decidedAt
                        ? expense.decidedAt.toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={expenseResult.page}
        totalPages={expenseResult.totalPages}
      />
    </main>
  );
}
