"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Filters from "@/components/common/Filters";

import CategoryComparisonChart from "@/features/analytics/components/charts/CategoryComparisonChart";

import ReportSummary from "@/features/analytics/components/reports/ReportSummary";
import LargestExpenses from "@/features/analytics/components/reports/LargestExpenses";
import TopCategories from "@/features/analytics/components/reports/TopCategories";

import type { AnalyticsExpense } from "@/features/analytics/types";

import {
  type ExpenseApprovalStatus,
  type ExpenseReimbursementStatus,
} from "@/features/expenses/components/StatusFilters";

import { ALL_CURRENCIES, type CurrencyFilter } from "@/constants/currencies";

type ReportsPageClientProps = {
  scope: "OWN" | "ALL" | "EMPLOYEES";
  expenses: AnalyticsExpense[];
  canChooseScope: boolean;
  defaultCurrency: string;
};

export default function ReportsPageClient({
  scope,
  expenses,
  canChooseScope,
  defaultCurrency,
}: ReportsPageClientProps) {
  const router = useRouter();

  /* ---------------------------------------------------------------------- */
  /* Filter state                                                           */
  /* ---------------------------------------------------------------------- */

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyFilter>(
    defaultCurrency as CurrencyFilter,
  );

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const [approvalStatus, setApprovalStatus] =
    useState<ExpenseApprovalStatus>("ALL");

  const [reimbursementStatus, setReimbursementStatus] =
    useState<ExpenseReimbursementStatus>("ALL");

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

  /* ---------------------------------------------------------------------- */
  /* Current date                                                           */
  /* ---------------------------------------------------------------------- */

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const todayString = [
    currentYear,
    String(currentMonth).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");

  /* ---------------------------------------------------------------------- */
  /* Earliest expense date                                                  */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Selected year/month information                                        */
  /* ---------------------------------------------------------------------- */

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

      const matchesCurrency =
        selectedCurrency === ALL_CURRENCIES ||
        expense.currency === selectedCurrency;

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
        matchesCurrency &&
        matchesCategory &&
        matchesApprovalStatus &&
        matchesReimbursementStatus &&
        matchesYear &&
        matchesMonth &&
        matchesDate
      );
    });
  }, [
    expenses,
    selectedCurrency,
    selectedCategory,
    approvalStatus,
    reimbursementStatus,
    selectedYear,
    selectedMonth,
    dateFilter,
    customStartDate,
    customEndDate,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Date preset state                                                      */
  /* ---------------------------------------------------------------------- */

  const disableDatePresets =
    isMonthSelected || (isYearSelected && !isCurrentYearSelected);

  /* ---------------------------------------------------------------------- */
  /* Currency used by report calculations                                   */
  /* ---------------------------------------------------------------------- */

  const reportCurrency =
    selectedCurrency === ALL_CURRENCIES ? defaultCurrency : selectedCurrency;

  /* ---------------------------------------------------------------------- */
  /* Clear filters                                                          */
  /* ---------------------------------------------------------------------- */

  function clearFilters() {
    setSelectedCurrency(defaultCurrency as CurrencyFilter);
    setSelectedCategory("");
    setSelectedYear("");
    setSelectedMonth("");
    setDateFilter("all");
    setApprovalStatus("ALL");
    setReimbursementStatus("ALL");
    setCustomStartDate("");
    setCustomEndDate("");
  }

  const hasActiveFilters =
    selectedCurrency !== defaultCurrency ||
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
      {canChooseScope && (
        <div className="mb-6 max-w-xs">
          <label
            htmlFor="report-scope"
            className="text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            Expense Scope
          </label>

          <select
            id="report-scope"
            value={scope}
            onChange={(event) => {
              router.push(`/reports?scope=${event.target.value}`);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
          >
            <option value="OWN">OWN</option>
            <option value="ALL">ALL</option>
            <option value="EMPLOYEES">EMPLOYEES</option>
          </select>
        </div>
      )}

      <Filters
        title="Filter Reports"
        description="Filter reports by currency, status, category, and date."
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        approvalStatus={approvalStatus}
        onApprovalStatusChange={setApprovalStatus}
        reimbursementStatus={reimbursementStatus}
        onReimbursementStatusChange={setReimbursementStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        years={years}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
        minDate={customMinDate}
        maxDate={customMaxDate}
        disableDatePresets={disableDatePresets}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <div className="mt-6 space-y-6">
        <ReportSummary expenses={filteredExpenses} currency={reportCurrency} />

        <CategoryComparisonChart
          expenses={filteredExpenses}
          selectedCurrency={selectedCurrency}
          defaultCurrency={defaultCurrency}
        />

        <LargestExpenses
          expenses={filteredExpenses}
          selectedCurrency={selectedCurrency}
          defaultCurrency={defaultCurrency}
        />

        <TopCategories
          expenses={filteredExpenses}
          selectedCurrency={selectedCurrency}
          defaultCurrency={defaultCurrency}
        />
      </div>
    </>
  );
}
