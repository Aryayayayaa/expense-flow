"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, Calendar, Folder, Plus, AlertTriangle } from "lucide-react";

import Pagination from "@/components/common/Pagination";
import Filters from "@/components/common/Filters";

import ExpenseList from "./ExpenseList";
import AddExpenseForm from "./AddExpenseForm";
import SummaryCard from "./SummaryCard";

import {
  type ExpenseApprovalStatus,
  type ExpenseReimbursementStatus,
} from "./StatusFilters";

import type { DisplayExpense } from "../types";

import {
  ALL_CURRENCIES,
  type CurrencyCode,
  type CurrencyFilter,
} from "@/constants/currencies";

import { formatCurrency } from "@/utils/formatCurrency";

type DeletedExpense = {
  id: number;
  originalExpenseId: number;
  title: string;
  amount: number;
  currency: string;
  category: string;
  expenseDate: Date | null;

  ocrReceiptUrl: string | null;
  ocrReceiptPath: string | null;
  ocrRawText: string | null;

  billProofUrl: string | null;
  billProofPath: string | null;

  deletionReason: string;
  deletedAt: Date;

  deletedBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };

  userId: number;
};

type ExpensesPageClientProps = {
  expenses: DisplayExpense[];
  deletedExpenses: DeletedExpense[];
  defaultCurrency: CurrencyCode;
  initialPage?: number;
};

const PAGE_SIZE = 10;

export default function ExpensesPageClient({
  expenses,
  deletedExpenses,
  defaultCurrency,
  initialPage = 1,
}: ExpensesPageClientProps) {
  const [editingExpense, setEditingExpense] = useState<DisplayExpense | null>(
    null,
  );

  /*
   * Pagination is intentionally local to this page.
   *
   * Filtering happens BEFORE pagination.
   */
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage));

  /* ---------------------------------------------------------------------- */
  /* Filters                                                                */
  /* ---------------------------------------------------------------------- */

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const [approvalStatus, setApprovalStatus] =
    useState<ExpenseApprovalStatus>("ALL");

  const [reimbursementStatus, setReimbursementStatus] =
    useState<ExpenseReimbursementStatus>("ALL");

  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyFilter>(ALL_CURRENCIES);

  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  /* ---------------------------------------------------------------------- */
  /* Filter data                                                            */
  /* ---------------------------------------------------------------------- */

  const categories = useMemo(
    () => [...new Set(expenses.map((expense) => expense.category))],
    [expenses],
  );

  const years = useMemo(
    () =>
      [
        ...new Set(
          expenses.map((expense) =>
            (expense.expenseDate ?? expense.createdAt).getFullYear(),
          ),
        ),
      ].sort((a, b) => b - a),
    [expenses],
  );

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const todayString = [
    currentYear,
    String(currentMonth).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");

  const earliestExpenseDate = expenses.reduce<Date | null>(
    (earliest, expense) => {
      const date = expense.expenseDate ?? expense.createdAt;

      if (!earliest || date < earliest) {
        return date;
      }

      return earliest;
    },
    null,
  );

  const minDate = earliestExpenseDate
    ? earliestExpenseDate.toISOString().slice(0, 10)
    : "";

  const isYearSelected = selectedYear !== "";
  const isMonthSelected = selectedMonth !== "";

  const selectedYearNumber = Number(selectedYear);
  const selectedMonthNumber = Number(selectedMonth);

  const isCurrentYearSelected =
    isYearSelected && selectedYearNumber === currentYear;

  /* ---------------------------------------------------------------------- */
  /* Custom date range                                                      */
  /* ---------------------------------------------------------------------- */

  let customMinDate = minDate;
  let customMaxDate = todayString;

  if (isYearSelected && isMonthSelected) {
    const lastDayOfSelectedMonth = new Date(
      selectedYearNumber,
      selectedMonthNumber,
      0,
    ).getDate();

    customMinDate = `${selectedYearNumber}-${String(
      selectedMonthNumber,
    ).padStart(2, "0")}-01`;

    customMaxDate = `${selectedYearNumber}-${String(
      selectedMonthNumber,
    ).padStart(2, "0")}-${String(lastDayOfSelectedMonth).padStart(2, "0")}`;

    if (
      selectedYearNumber === currentYear &&
      selectedMonthNumber === currentMonth
    ) {
      customMaxDate = todayString;
    }
  } else if (isYearSelected) {
    customMinDate = `${selectedYearNumber}-01-01`;

    customMaxDate = isCurrentYearSelected
      ? todayString
      : `${selectedYearNumber}-12-31`;
  } else if (isMonthSelected) {
    const lastDayOfSelectedMonth = new Date(
      currentYear,
      selectedMonthNumber,
      0,
    ).getDate();

    customMinDate = `${currentYear}-${String(selectedMonthNumber).padStart(
      2,
      "0",
    )}-01`;

    customMaxDate = `${currentYear}-${String(selectedMonthNumber).padStart(
      2,
      "0",
    )}-${String(lastDayOfSelectedMonth).padStart(2, "0")}`;

    if (selectedMonthNumber === currentMonth) {
      customMaxDate = todayString;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Filter expenses                                                        */
  /* ---------------------------------------------------------------------- */

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = expense.expenseDate ?? expense.createdAt;

      /*
       * IMPORTANT:
       *
       * Currency filtering uses the ORIGINAL currency stored
       * on the expense.
       *
       * Therefore:
       *
       * USD filter → only expenses originally saved as USD
       * INR filter → only expenses originally saved as INR
       *
       * An INR expense converted to USD for display does NOT
       * become a USD expense.
       */
      const matchesCurrency =
        selectedCurrency === ALL_CURRENCIES ||
        expense.currency.toUpperCase() === selectedCurrency.toUpperCase();

      const matchesCategory =
        selectedCategory === "" || expense.category === selectedCategory;

      const matchesApprovalStatus =
        approvalStatus === "ALL" || expense.status === approvalStatus;

      const matchesReimbursementStatus =
        reimbursementStatus === "ALL" ||
        expense.reimbursementStatus === reimbursementStatus;

      const matchesYear =
        selectedYear === "" ||
        expenseDate.getFullYear() === Number(selectedYear);

      const matchesMonth =
        selectedMonth === "" ||
        expenseDate.getMonth() + 1 === Number(selectedMonth);

      let matchesDate = true;

      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfToday.getDate() + 1);

      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfToday.getDate() - 1);

      const startOfLast7Days = new Date(startOfToday);
      startOfLast7Days.setDate(startOfToday.getDate() - 6);

      const startOfLast30Days = new Date(startOfToday);
      startOfLast30Days.setDate(startOfToday.getDate() - 29);

      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      );

      const startOfThisYear = new Date(now.getFullYear(), 0, 1);

      const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);

      switch (dateFilter) {
        case "today":
          matchesDate =
            expenseDate >= startOfToday && expenseDate < startOfTomorrow;
          break;

        case "yesterday":
          matchesDate =
            expenseDate >= startOfYesterday && expenseDate < startOfToday;
          break;

        case "last-7-days":
          matchesDate =
            expenseDate >= startOfLast7Days && expenseDate < startOfTomorrow;
          break;

        case "last-30-days":
          matchesDate =
            expenseDate >= startOfLast30Days && expenseDate < startOfTomorrow;
          break;

        case "this-month":
          matchesDate =
            expenseDate >= startOfThisMonth && expenseDate < startOfNextMonth;
          break;

        case "last-month":
          matchesDate =
            expenseDate >= startOfLastMonth && expenseDate < startOfThisMonth;
          break;

        case "this-year":
          matchesDate =
            expenseDate >= startOfThisYear && expenseDate < startOfNextYear;
          break;

        case "custom":
          if (customStartDate && customEndDate) {
            const start = new Date(`${customStartDate}T00:00:00`);
            const end = new Date(`${customEndDate}T23:59:59`);

            matchesDate = expenseDate >= start && expenseDate <= end;
          }
          break;

        case "all":
        default:
          matchesDate = true;
      }

      return (
        matchesCategory &&
        matchesCurrency &&
        matchesApprovalStatus &&
        matchesReimbursementStatus &&
        matchesYear &&
        matchesMonth &&
        matchesDate
      );
    });
  }, [
    expenses,
    selectedCategory,
    selectedCurrency,
    approvalStatus,
    reimbursementStatus,
    selectedYear,
    selectedMonth,
    dateFilter,
    customStartDate,
    customEndDate,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Pagination                                                             */
  /* ---------------------------------------------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / PAGE_SIZE),
  );

  /*
   * Keep the current page valid if filtering reduces the number
   * of matching expenses.
   */
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, safeCurrentPage]);

  function changePage(page: number) {
    const nextPage = Math.min(Math.max(1, page), totalPages);

    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * Any filter change starts from page 1.
   *
   * This is critical for cases such as:
   *
   * ALL CURRENCIES → USD
   *
   * where the currently selected page may no longer exist
   * in the filtered result.
   */
  function resetPagination() {
    setCurrentPage(1);
  }

  /* ---------------------------------------------------------------------- */
  /* Display amount                                                         */
  /* ---------------------------------------------------------------------- */

  function getDisplayAmount(expense: DisplayExpense) {
    return Number(expense.displayAmount);
  }

  /* ---------------------------------------------------------------------- */
  /* Summary                                                                */
  /* ---------------------------------------------------------------------- */

  /*
   * IMPORTANT:
   *
   * Summary calculations use filteredExpenses, NOT
   * paginatedExpenses.
   *
   * Therefore an expense on page 2 still contributes
   * to Total Expenses / This Month / Categories.
   */
  const summaryCurrency = defaultCurrency;

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + getDisplayAmount(expense),
    0,
  );

  const thisMonthExpenses = filteredExpenses
    .filter((expense) => {
      const expenseDate = expense.expenseDate ?? expense.createdAt;

      return (
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + getDisplayAmount(expense), 0);

  const totalCategories = new Set(
    filteredExpenses.map((expense) => expense.category),
  ).size;

  const disableDatePresets =
    isMonthSelected || (isYearSelected && !isCurrentYearSelected);

  /* ---------------------------------------------------------------------- */
  /* Clear filters                                                          */
  /* ---------------------------------------------------------------------- */

  function clearFilters() {
    setSelectedCurrency(ALL_CURRENCIES);
    setSelectedCategory("");
    setSelectedYear("");
    setSelectedMonth("");
    setDateFilter("all");
    setApprovalStatus("ALL");
    setReimbursementStatus("ALL");
    setCustomStartDate("");
    setCustomEndDate("");

    resetPagination();
  }

  const hasActiveFilters =
    selectedCurrency !== ALL_CURRENCIES ||
    selectedCategory !== "" ||
    selectedYear !== "" ||
    selectedMonth !== "" ||
    dateFilter !== "all" ||
    approvalStatus !== "ALL" ||
    reimbursementStatus !== "ALL";

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <h2 className="text-3xl font-medium text-slate-500 dark:text-white">
        My Expenses
        <div>
          <p className="mt-1 text-sm text-slate-500">
            {filteredExpenses.length}{" "}
            {filteredExpenses.length === 1 ? "expense" : "expenses"} found
          </p>
        </div>
      </h2>

      {/* Summary cards */}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses, summaryCurrency)}
          icon={<Wallet size={20} />}
        />

        <SummaryCard
          title="This Month"
          value={formatCurrency(thisMonthExpenses, summaryCurrency)}
          icon={<Calendar size={20} />}
        />

        <SummaryCard
          title="Categories"
          value={totalCategories}
          icon={<Folder size={20} />}
        />
      </div>

      {/* Admin deleted expense notification */}

      {deletedExpenses.length > 0 && (
        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                Admin Removed Expenses
              </h2>

              <p className="mt-1 text-xs text-amber-800">
                The following expense
                {deletedExpenses.length === 1 ? " was" : "s were"} removed by an
                administrator.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {deletedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-lg border border-amber-200 bg-white p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {expense.title}
                      </h3>

                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                        DELETED
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(expense.amount, expense.currency)} •{" "}
                      {expense.category}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500">
                    Deleted on{" "}
                    {new Date(expense.deletedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Deleted by
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {expense.deletedBy.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {expense.deletedBy.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Original Expense ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      #{expense.originalExpenseId}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    Reason for deletion
                  </p>

                  <p className="mt-1 text-sm text-red-900">
                    {expense.deletionReason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Common filters */}

      <Filters
        selectedCurrency={selectedCurrency}
        onCurrencyChange={(value) => {
          setSelectedCurrency(value);
          resetPagination();
        }}
        approvalStatus={approvalStatus}
        onApprovalStatusChange={(value) => {
          setApprovalStatus(value);
          resetPagination();
        }}
        reimbursementStatus={reimbursementStatus}
        onReimbursementStatusChange={(value) => {
          setReimbursementStatus(value);
          resetPagination();
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(value) => {
          setSelectedCategory(value);
          resetPagination();
        }}
        categories={categories}
        selectedYear={selectedYear}
        onYearChange={(value) => {
          setSelectedYear(value);
          resetPagination();
        }}
        years={years}
        selectedMonth={selectedMonth}
        onMonthChange={(value) => {
          setSelectedMonth(value);
          resetPagination();
        }}
        dateFilter={dateFilter}
        onDateFilterChange={(value) => {
          setDateFilter(value);
          resetPagination();
        }}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={(value) => {
          setCustomStartDate(value);
          resetPagination();
        }}
        onCustomEndDateChange={(value) => {
          setCustomEndDate(value);
          resetPagination();
        }}
        minDate={customMinDate}
        maxDate={customMaxDate}
        disableDatePresets={disableDatePresets}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* Add expense */}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/expenses/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New Expense
        </Link>
      </div>

      {/* Expense cards */}

      <div className="mt-4">
        <ExpenseList expenses={paginatedExpenses} onEdit={setEditingExpense} />
      </div>

      {/* Edit Expense */}

      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <AddExpenseForm
              editingExpense={editingExpense}
              setEditingExpense={setEditingExpense}
            />
          </div>
        </div>
      )}

      {/* Pagination */}

      <Pagination
        page={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={changePage}
      />
    </>
  );
}
