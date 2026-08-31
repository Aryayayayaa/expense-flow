"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Filters from "@/components/common/Filters";

import AnalyticsTabs from "@/features/analytics/components/AnalyticsTabs";

import CategoryPieChart from "@/features/analytics/components/charts/CategoryPieChart";
import CategoryComparisonChart from "@/features/analytics/components/charts/CategoryComparisonChart";
import MonthlyTrendChart from "@/features/analytics/components/charts/MonthlyTrendChart";
import MonthlyCategoryTrendChart from "@/features/analytics/components/charts/MonthlyCategoryTrendChart";
import YearlyTrendChart from "@/features/analytics/components/charts/YearlyTrendChart";
import YearlyCategoryChart from "@/features/analytics/components/charts/YearlyCategoryChart";

import ReportSummary from "@/features/analytics/components/reports/ReportSummary";
import LargestExpenses from "@/features/analytics/components/reports/LargestExpenses";
import TopCategories from "@/features/analytics/components/reports/TopCategories";

import type { AnalyticsExpense } from "@/features/analytics/types";

import type {
  ExpenseApprovalStatus,
  ExpenseReimbursementStatus,
} from "@/features/expenses/components/StatusFilters";

import { ALL_CURRENCIES, type CurrencyFilter } from "@/constants/currencies";

import type { AnalyticsScope } from "@/features/analytics/lib/getAnalyticsData";

import { capitalize } from "@/utils/capitalize";
import { formatDate } from "@/utils/formatDate";

type AnalyticsTab = "analysis" | "reports";

type AppliedFilter = {
  key: string;
  label: string;
  value: string;
};

const MONTH_LABELS: Record<string, string> = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

const DATE_FILTER_LABELS: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "last-7-days": "Last 7 Days",
  "last-30-days": "Last 30 Days",
  "this-month": "This Month",
  "last-month": "Last Month",
  "this-year": "This Year",
};

function formatDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return formatDate(new Date(year, month - 1, day));
}

function getDateFilterValue(
  dateFilter: string,
  customStartDate: string,
  customEndDate: string,
) {
  if (dateFilter === "custom") {
    if (customStartDate && customEndDate) {
      return `${formatDateInput(customStartDate)} – ${formatDateInput(customEndDate)}`;
    }

    if (customStartDate) {
      return `From ${formatDateInput(customStartDate)}`;
    }

    if (customEndDate) {
      return `Until ${formatDateInput(customEndDate)}`;
    }

    return "Custom Range";
  }

  return DATE_FILTER_LABELS[dateFilter] ?? dateFilter;
}

type InsightsPageClientProps = {
  expenses: AnalyticsExpense[];
  scope: AnalyticsScope;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  canChooseScope: boolean;
  defaultCurrency: string;
};

export default function InsightsPageClient({
  expenses,
  scope,
  role,
  canChooseScope,
  defaultCurrency,
}: InsightsPageClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("analysis");

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

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const todayString = [
    currentYear,
    String(currentMonth).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");

  const categories = [...new Set(expenses.map((expense) => expense.category))];

  const years = [
    ...new Set(
      expenses.map((expense) =>
        (expense.expenseDate ?? expense.createdAt).getFullYear(),
      ),
    ),
  ].sort((a, b) => b - a);

  const isYearSelected = selectedYear !== "";
  const isMonthSelected = selectedMonth !== "";

  const selectedYearNumber = Number(selectedYear);
  const selectedMonthNumber = Number(selectedMonth);

  const isCurrentYearSelected =
    isYearSelected && selectedYearNumber === currentYear;

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

  const filteredExpenses = expenses.filter((expense) => {
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
      selectedYear === "" || expenseDate.getFullYear() === selectedYearNumber;

    const matchesMonth =
      selectedMonth === "" ||
      expenseDate.getMonth() + 1 === selectedMonthNumber;

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

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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

  const disableDatePresets =
    isMonthSelected || (isYearSelected && !isCurrentYearSelected);

  /* ---------------------------------------------------------------------- */
  /* Report currency                                                        */
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

  const appliedFilters: AppliedFilter[] = [
    {
      key: "currency",
      label: "Currency",
      value:
        selectedCurrency === ALL_CURRENCIES
          ? "All Currencies"
          : selectedCurrency,
    },
  ];

  if (approvalStatus !== "ALL") {
    appliedFilters.push({
      key: "approval",
      label: "Approval",
      value: capitalize(approvalStatus),
    });
  }

  if (reimbursementStatus !== "ALL") {
    appliedFilters.push({
      key: "reimbursement",
      label: "Reimbursement",
      value: capitalize(reimbursementStatus),
    });
  }

  if (selectedCategory !== "") {
    appliedFilters.push({
      key: "category",
      label: "Category",
      value: selectedCategory,
    });
  }

  if (selectedYear !== "") {
    appliedFilters.push({
      key: "year",
      label: "Year",
      value: selectedYear,
    });
  }

  if (selectedMonth !== "") {
    appliedFilters.push({
      key: "month",
      label: "Month",
      value: MONTH_LABELS[selectedMonth] ?? selectedMonth,
    });
  }

  if (dateFilter !== "all") {
    appliedFilters.push({
      key: "date",
      label: "Date",
      value: getDateFilterValue(dateFilter, customStartDate, customEndDate),
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Scope options                                                          */
  /* ---------------------------------------------------------------------- */

  const scopeOptions: {
    value: AnalyticsScope;
    label: string;
  }[] =
    role === "ADMIN"
      ? [
          {
            value: "OWN",
            label: "OWN",
          },
          {
            value: "ALL",
            label: "ALL",
          },
          {
            value: "EMPLOYEES",
            label: "EMPLOYEES",
          },
          {
            value: "OTHER_ADMINS",
            label: "OTHER ADMINS",
          },
          {
            value: "HRS",
            label: "HRs",
          },
        ]
      : role === "HR"
        ? [
            {
              value: "OWN",
              label: "OWN",
            },
            {
              value: "ALL",
              label: "ALL",
            },
            {
              value: "EMPLOYEES",
              label: "EMPLOYEES",
            },
            {
              value: "OTHER_HRS",
              label: "OTHER HRs",
            },
            {
              value: "ADMINS",
              label: "ADMINS",
            },
          ]
        : [];

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <div>
      {(role === "ADMIN" || role === "HR") && canChooseScope && (
        <div className="mb-6 max-w-xs">
          <label
            htmlFor="insights-scope"
            className="text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            Expense Scope
          </label>

          <select
            id="insights-scope"
            value={scope}
            onChange={(event) => {
              router.push(`/insights?scope=${event.target.value}`);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
          >
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <Filters
        title="Filter Insights"
        description="Filter insights by currency, status, category, and date."
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

      <div className="mt-6">
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("analysis")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "analysis"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Analysis
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "reports"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Reports
          </button>
        </div>

        {activeTab === "analysis" && (
          <InsightsAnalysis
            expenses={filteredExpenses}
            selectedCurrency={selectedCurrency}
            defaultCurrency={defaultCurrency}
            appliedFilters={appliedFilters}
          />
        )}

        {activeTab === "reports" && (
          <InsightsReports
            expenses={filteredExpenses}
            selectedCurrency={selectedCurrency}
            defaultCurrency={defaultCurrency}
            reportCurrency={reportCurrency}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Analysis                                                                  */
/* -------------------------------------------------------------------------- */

type InsightsAnalysisProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
  appliedFilters: AppliedFilter[];
};

function InsightsAnalysis({
  expenses,
  selectedCurrency,
  defaultCurrency,
  appliedFilters,
}: InsightsAnalysisProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "monthly-yearly">(
    "categories",
  );

  return (
    <div>
      <AnalyticsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow dark:border-slate-700 dark:bg-slate-900">
        {activeTab === "categories" && (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Category Breakdown
                </h2>

                <p className="mt-2 text-gray-500 dark:text-slate-400">
                  See how your total expenses are distributed across categories.
                </p>
              </div>

              <div className="flex max-w-xl flex-wrap items-center gap-2 sm:justify-end">
                {appliedFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-blue-950 dark:text-blue-200"
                  >
                    <span className="text-slate-900 dark:text-blue-100">
                      {filter.label}
                    </span>
                    <span className="text-slate-500 dark:text-blue-300">
                      {filter.value}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <CategoryPieChart
                expenses={expenses}
                selectedCurrency={selectedCurrency}
                defaultCurrency={defaultCurrency}
              />
            </div>

            <div className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Category Comparison
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Compare total spending across expense categories.
              </p>

              <div className="mt-6">
                <CategoryComparisonChart
                  expenses={expenses}
                  selectedCurrency={selectedCurrency}
                  defaultCurrency={defaultCurrency}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "monthly-yearly" && (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Monthly and Yearly Graphs
              </h2>

              <p className="mt-2 text-gray-500 dark:text-slate-400">
                Track total spending and category-wise spending across months
                and years.
              </p>
            </div>

            {/* Total Monthly / Total Yearly */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Total Monthly Expense
                </h3>

                <MonthlyTrendChart
                  expenses={expenses}
                  selectedCurrency={selectedCurrency}
                  defaultCurrency={defaultCurrency}
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Total Yearly Expenses
                </h3>

                <YearlyTrendChart
                  expenses={expenses}
                  selectedCurrency={selectedCurrency}
                  defaultCurrency={defaultCurrency}
                />
              </div>
            </div>

            {/* Monthly Category / Yearly Category */}
            <div className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-700">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Monthly Expenses By Category
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    Compare how each expense category changes month by month.
                  </p>

                  <MonthlyCategoryTrendChart
                    expenses={expenses}
                    selectedCurrency={selectedCurrency}
                    defaultCurrency={defaultCurrency}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Yearly Expenses By Category
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    Compare category-wise spending across different years.
                  </p>

                  <YearlyCategoryChart
                    expenses={expenses}
                    selectedCurrency={selectedCurrency}
                    defaultCurrency={defaultCurrency}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reports                                                                    */
/* -------------------------------------------------------------------------- */

type InsightsReportsProps = {
  expenses: AnalyticsExpense[];
  selectedCurrency: string;
  defaultCurrency: string;
  reportCurrency: string;
};

function InsightsReports({
  expenses,
  selectedCurrency,
  defaultCurrency,
  reportCurrency,
}: InsightsReportsProps) {
  return (
    <div className="space-y-6">
      <ReportSummary expenses={expenses} currency={reportCurrency} />

      <CategoryComparisonChart
        expenses={expenses}
        selectedCurrency={selectedCurrency}
        defaultCurrency={defaultCurrency}
      />

      <LargestExpenses
        expenses={expenses}
        selectedCurrency={selectedCurrency}
        defaultCurrency={defaultCurrency}
      />

      <TopCategories
        expenses={expenses}
        selectedCurrency={selectedCurrency}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}
