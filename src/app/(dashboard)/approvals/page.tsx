import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { CurrencyCode } from "@/constants/currencies";

import { getExchangeRate } from "@/features/expenses/lib/exchange-rates";

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
import ApprovalHistoryTable from "@/features/approvals/components/ApprovalHistoryTable";
import MyExpenseStatusTable from "@/features/approvals/components/MyExpenseStatusTable";

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
  const defaultCurrency = session.user.defaultCurrency as CurrencyCode;

  /*
   * Get the exchange rate needed to convert the application's
   * stored base currency (INR) into the user's current default currency.
   *
   * Example:
   *
   * defaultCurrency = USD
   * USD -> INR rate = 92
   *
   * INR 188 / 92 = USD 2.04
   */
  const displayRateToInr =
    defaultCurrency === "INR"
      ? 1
      : (await getExchangeRate(defaultCurrency, "INR")).rate;

  /*
   * ADMIN
   *
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

    const serializedPendingExpenses = pendingExpenses.map((expense) => {
      const amount = Number(expense.amount);

      /*
       * If the expense was created in the Admin's current
       * default currency, the original amount can be displayed directly.
       */
      if (expense.currency === defaultCurrency) {
        return {
          ...expense,
          amount,
          baseCurrencyAmount:
            expense.baseCurrencyAmount !== null
              ? Number(expense.baseCurrencyAmount)
              : null,
          exchangeRate:
            expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,
          displayAmount: amount,
        };
      }

      /*
       * The application's stored base currency is INR.
       *
       * Existing INR expenses may not have baseCurrencyAmount,
       * so for those expenses the original amount itself is the
       * normalized INR amount.
       */
      const baseCurrencyAmount =
        expense.baseCurrencyAmount !== null
          ? Number(expense.baseCurrencyAmount)
          : expense.currency === "INR"
            ? amount
            : 0;

      /*
       * getExchangeRate(defaultCurrency, "INR") means:
       *
       * 1 defaultCurrency = X INR
       *
       * Therefore:
       *
       * INR amount / X = defaultCurrency amount
       */
      const displayAmount =
        defaultCurrency === "INR"
          ? baseCurrencyAmount
          : baseCurrencyAmount / displayRateToInr;

      return {
        ...expense,
        amount,
        baseCurrencyAmount,
        exchangeRate:
          expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,
        displayAmount,
      };
    });

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
            <ApprovalHistoryTable expenses={history.expenses} />

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
   *
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
    defaultCurrency,
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

      <MyExpenseStatusTable expenses={expenses} />

      <Pagination
        page={expenseResult.page}
        totalPages={expenseResult.totalPages}
      />
    </main>
  );
}
