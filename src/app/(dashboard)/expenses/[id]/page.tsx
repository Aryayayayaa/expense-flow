import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ReceiptText,
  Tag,
  User,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate, formatTime } from "@/utils/formatDate";
import { getDisplayExpenseAmount } from "@/features/expenses/lib/display-currency";

import ReceiptViewerButton from "@/features/expenses/components/ReceiptViewerButton";
import ExpenseDetailsActions from "./ExpenseDetailsActions";

type ExpensePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpensePage({ params }: ExpensePageProps) {
  const { id } = await params;

  const expenseId = Number(id);

  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    notFound();
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  //const role = session.user.role;

  /*
   * Use the user's CURRENT default currency for display.
   *
   * The expense's stored currency is never changed.
   *
   * This allows the same expense to be displayed in the user's
   * current preferred currency even if that preference changes later.
   */
  const defaultCurrency = session.user.defaultCurrency ?? "INR";

  /*
   * Employees can only view their own expenses.
   *
   * Admin and HR can view expenses belonging to other users.
   */
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      decidedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      reimbursementBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  /*
   * The expense may have been deleted or the employee may
   * not have permission to view it.
   */
  if (!expense) {
    notFound();
  }

  const isPending = expense.status === "PENDING";
  const isApproved = expense.status === "APPROVED";
  const isRejected = expense.status === "REJECTED";

  const hasReceipt = Boolean(expense.ocrReceiptUrl || expense.ocrReceiptPath);

  const isReimbursed = expense.reimbursementStatus === "REIMBURSED";
  const isReimbursementRejected = expense.reimbursementStatus === "REJECTED";

  /*
   * Calculate the amount using the user's CURRENT default currency.
   *
   * Example:
   *
   * Expense stored as:
   *   USD 100
   *
   * Current default currency:
   *   INR
   *
   * Display:
   *   ₹8,xxx
   *   Originally entered: $100
   *
   * If the user later changes their default currency to EUR,
   * this same expense will automatically display in EUR while
   * still showing the original USD amount.
   */
  const displayAmount = await getDisplayExpenseAmount(
    {
      amount: Number(expense.amount),
      currency: expense.currency,
      baseCurrencyAmount: expense.baseCurrencyAmount
        ? Number(expense.baseCurrencyAmount)
        : null,
      exchangeRate: expense.exchangeRate ? Number(expense.exchangeRate) : null,
    },
    defaultCurrency,
  );

  /*
   * Check whether the expense's original currency is different
   * from the user's current default currency.
   */
  const hasDifferentDisplayCurrency =
    expense.currency.trim().toUpperCase() !==
    defaultCurrency.trim().toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/expenses"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Expenses
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {expense.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">Expense Details</p>
            </div>

            {isPending && (
              <ExpenseDetailsActions
                expense={{
                  id: expense.id,
                  title: expense.title,
                  amount: Number(expense.amount),
                  currency: expense.currency,
                  category: expense.category,
                  expenseDate: expense.expenseDate?.toISOString() ?? null,
                  createdAt: expense.createdAt.toISOString(),
                  ocrReceiptUrl: expense.ocrReceiptUrl,
                  ocrReceiptPath: expense.ocrReceiptPath,
                }}
              />
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Amount and basic details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Expense Amount
              </p>

              <div>
                {/* Current default currency amount */}
                <p className="text-4xl font-bold tracking-tight text-green-600">
                  {formatCurrency(displayAmount, defaultCurrency)}
                </p>

                {/* Original entered amount when currencies differ */}
                {hasDifferentDisplayCurrency && (
                  <p className="mt-2 text-sm text-slate-500">
                    Originally entered:{" "}
                    <span className="font-medium text-slate-700">
                      {formatCurrency(Number(expense.amount), expense.currency)}
                    </span>
                  </p>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<Tag size={18} />}
                  label="Category"
                  value={expense.category}
                />

                <InfoItem
                  icon={<CalendarDays size={18} />}
                  label="Expense Date"
                  value={formatDate(expense.expenseDate ?? expense.createdAt)}
                />

                <InfoItem
                  icon={<Clock3 size={18} />}
                  label="Expense Time"
                  value={formatTime(expense.expenseDate ?? expense.createdAt)}
                />

                <InfoItem
                  icon={<FileText size={18} />}
                  label="Currency"
                  value={expense.currency}
                />
              </div>
            </section>

            {/* Expense status */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Expense Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current approval and reimbursement status.
                </p>
              </div>

              {/* Approval Status */}
              {isPending && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-3">
                    <Clock3 size={20} className="text-amber-600" />

                    <div>
                      <p className="font-semibold text-amber-900">
                        Pending Approval
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        This expense is waiting for review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isApproved && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600" />

                    <div>
                      <p className="font-semibold text-green-900">Approved</p>

                      <p className="mt-1 text-sm text-green-700">
                        This expense has been approved.
                      </p>
                    </div>
                  </div>

                  {expense.decidedBy && (
                    <div className="mt-4 border-t border-green-200 pt-3 text-sm text-green-700">
                      <p>
                        <span className="font-medium">Approved by:</span>{" "}
                        {expense.decidedBy.name}
                      </p>

                      {expense.decidedAt && (
                        <p className="mt-1">
                          <span className="font-medium">Approved on:</span>{" "}
                          {formatDate(expense.decidedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isRejected && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-3">
                    <XCircle size={20} className="text-red-600" />

                    <div>
                      <p className="font-semibold text-red-900">Rejected</p>

                      <p className="mt-1 text-sm text-red-700">
                        This expense was rejected.
                      </p>
                    </div>
                  </div>

                  {expense.decidedBy && (
                    <div className="mt-4 border-t border-red-200 pt-3 text-sm text-red-700">
                      <p>
                        <span className="font-medium">Rejected by:</span>{" "}
                        {expense.decidedBy.name}
                      </p>

                      {expense.decidedAt && (
                        <p className="mt-1">
                          <span className="font-medium">Rejected on:</span>{" "}
                          {formatDate(expense.decidedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {expense.rejectionReason && (
                    <div className="mt-4 border-t border-red-200 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                        Rejection Reason
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        {expense.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reimbursement Status */}
              {(isApproved || isReimbursed || isReimbursementRejected) && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <Banknote size={20} className="text-blue-600" />

                    <div>
                      <p className="font-semibold text-blue-900">
                        Reimbursement Status
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        {isReimbursed
                          ? "Reimbursed"
                          : isReimbursementRejected
                            ? "Reimbursement Rejected"
                            : "Pending Reimbursement"}
                      </p>
                    </div>
                  </div>

                  {isReimbursed && expense.reimbursementBy && (
                    <div className="mt-4 border-t border-blue-200 pt-3 text-sm text-blue-700">
                      <p>
                        <span className="font-medium">Reimbursed by:</span>{" "}
                        {expense.reimbursementBy.name}
                      </p>

                      {expense.reimbursementAt && (
                        <p className="mt-1">
                          <span className="font-medium">Reimbursed on:</span>{" "}
                          {formatDate(expense.reimbursementAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Receipt */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <ReceiptText size={20} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Receipt
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Receipt associated with this expense.
                  </p>
                </div>
              </div>

              {hasReceipt ? (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-blue-900">
                        Receipt Attached
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        The receipt is attached to this expense.
                      </p>
                    </div>

                    <ReceiptViewerButton expenseId={expense.id} />
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <ReceiptText size={28} className="mx-auto text-slate-400" />

                  <p className="mt-3 font-medium text-slate-700">
                    No receipt attached
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    A receipt has not been attached to this expense.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Employee */}
            {expense.user && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2">
                    <User size={20} className="text-slate-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">Employee</h2>

                    <p className="text-sm text-slate-500">Expense owner</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="font-medium text-slate-900">
                    {expense.user.name}
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {expense.user.email}
                  </p>
                </div>
              </section>
            )}

            {/* Reimbursement */}
            {(isApproved || isReimbursed || isReimbursementRejected) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Banknote size={20} className="text-blue-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Reimbursement
                    </h2>

                    <p className="text-sm text-slate-500">
                      Reimbursement information
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-500">Status</p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {isReimbursed
                      ? "Reimbursed"
                      : isReimbursementRejected
                        ? "Rejected"
                        : "Pending Reimbursement"}
                  </p>

                  {isReimbursed && expense.reimbursementBy && (
                    <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">Reimbursed by:</span>{" "}
                        {expense.reimbursementBy.name}
                      </p>

                      {expense.reimbursementAt && (
                        <p className="mt-2">
                          <span className="font-medium">Reimbursed on:</span>{" "}
                          {formatDate(expense.reimbursementAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Expense Summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Category" value={expense.category} />

                <SummaryRow label="Currency" value={expense.currency} />

                <SummaryRow
                  label="Receipt"
                  value={hasReceipt ? "Attached" : "Not attached"}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mt-0.5 text-slate-500">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>

      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
