"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AnalyticsTabs from "./AnalyticsTabs";

import CategoryFilter from "@/features/expenses/components/CategoryFilter";
import YearFilter from "@/features/expenses/components/YearFilter";
import MonthFilter from "@/features/expenses/components/MonthFilter";
import DateFilter from "@/features/expenses/components/DateFilter";

import { SUPPORTED_CURRENCIES } from "@/constants/currencies";

import CategoryPieChart from "./charts/CategoryPieChart";
import MonthlyTrendChart from "./charts/MonthlyTrendChart";
import YearlyTrendChart from "./charts/YearlyTrendChart";
import MonthlyCategoryTrendChart from "./charts/MonthlyCategoryTrendChart";
import YearlyCategoryChart from "./charts/YearlyCategoryChart";
import CategoryComparisonChart from "./charts/CategoryComparisonChart";

import { AnalyticsExpense } from "../types";

type AnalyticsScope = "OWN" | "ALL" | "EMPLOYEES";

type AnalyticsPageClientProps = {
  expenses: AnalyticsExpense[];
  scope: AnalyticsScope;
  role: "ADMIN" | "HR" | "EMPLOYEE";
};

type AnalyticsTab = "categories" | "monthly" | "yearly";

export default function AnalyticsPageClient({
  expenses,
  scope,
  role,
}: AnalyticsPageClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("categories");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const [selectedCurrency, setSelectedCurrency] = useState("DEFAULT");

  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

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
  const selectedYearNumber = Number(selectedYear);

  const isCurrentYearSelected =
    isYearSelected && selectedYearNumber === currentYear;

  const isMonthSelected = selectedMonth !== "";
  const selectedMonthNumber = Number(selectedMonth);

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

    if (isCurrentYearSelected) {
      customMaxDate = todayString;
    } else {
      customMaxDate = `${selectedYearNumber}-12-31`;
    }
  } else if (isMonthSelected) {
    const currentYearForMonthRange = currentYear;

    const lastDayOfSelectedMonth = new Date(
      currentYearForMonthRange,
      selectedMonthNumber,
      0,
    ).getDate();

    customMinDate = `${currentYearForMonthRange}-${String(
      selectedMonthNumber,
    ).padStart(2, "0")}-01`;

    customMaxDate = `${currentYearForMonthRange}-${String(
      selectedMonthNumber,
    ).padStart(2, "0")}-${String(lastDayOfSelectedMonth).padStart(2, "0")}`;

    if (selectedMonthNumber === currentMonth) {
      customMaxDate = todayString;
    }
  }

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = expense.expenseDate ?? expense.createdAt;

    // Category filter
    const matchesCategory =
      selectedCategory === "" || expense.category === selectedCategory;

    // Currency filter.
    //
    // DEFAULT = include every original transaction currency.
    // Otherwise only include expenses originally recorded
    // in the selected currency. No currency conversion is performed.
    const matchesCurrency =
      selectedCurrency === "DEFAULT" || expense.currency === selectedCurrency;

    // Year filter
    const matchesYear =
      selectedYear === "" || expenseDate.getFullYear() === Number(selectedYear);

    // Month filter
    const matchesMonth =
      selectedMonth === "" ||
      expenseDate.getMonth() + 1 === Number(selectedMonth);

    // Date filter
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
      matchesCategory &&
      matchesCurrency &&
      matchesYear &&
      matchesMonth &&
      matchesDate
    );
  });

  const disableDatePresets =
    isMonthSelected || (isYearSelected && !isCurrentYearSelected);

  return (
    <div>
      <div className="mb-6 rounded-lg border bg-gray-50 p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Filter Analytics
        </h2>

        {(role === "ADMIN" || role === "HR") && (
          <div className="flex min-w-[180px] flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Expense Scope
            </label>

            <select
              value={scope}
              onChange={(event) => {
                router.push(`/analytics?scope=${event.target.value}`);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="OWN">OWN</option>
              <option value="ALL">ALL</option>
              <option value="EMPLOYEES">EMPLOYEES</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex min-w-[180px] flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Currency
            </label>

            <select
              value={selectedCurrency}
              onChange={(event) => setSelectedCurrency(event.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="DEFAULT">Default — All Currencies</option>

              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} — {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          <CategoryFilter
            value={selectedCategory}
            onChange={setSelectedCategory}
            categories={categories}
          />

          <YearFilter
            value={selectedYear}
            years={years}
            onChange={setSelectedYear}
          />

          <MonthFilter
            value={selectedMonth}
            selectedYear={selectedYear}
            onChange={setSelectedMonth}
          />

          <DateFilter
            value={dateFilter}
            onChange={setDateFilter}
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={setCustomStartDate}
            onEndDateChange={setCustomEndDate}
            minDate={customMinDate}
            maxDate={customMaxDate}
            disablePresets={disableDatePresets}
          />
        </div>
      </div>

      <AnalyticsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="rounded-lg border bg-white p-8 shadow">
        {activeTab === "categories" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Category Breakdown
            </h2>

            <p className="mt-2 text-gray-500">
              See how your total expenses are distributed across categories.
            </p>

            <div className="mt-6">
              <CategoryPieChart expenses={filteredExpenses} />
            </div>

            <div className="mt-10 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Category Comparison
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Compare total spending across expense categories.
              </p>

              <div className="mt-6">
                <CategoryComparisonChart expenses={filteredExpenses} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Monthly Trends
            </h2>

            <p className="mt-2 text-gray-500">
              Track your total spending and category-wise spending over time.
            </p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Monthly Expenses
              </h3>

              <MonthlyTrendChart expenses={filteredExpenses} />
            </div>

            <div className="mt-10 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Expenses by Category
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Compare how each expense category changes month by month.
              </p>

              <MonthlyCategoryTrendChart expenses={filteredExpenses} />
            </div>
          </div>
        )}

        {activeTab === "yearly" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Yearly Trends
            </h2>

            <p className="mt-2 text-gray-500">
              Track your total spending and category-wise spending across years.
            </p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Yearly Expenses
              </h3>

              <YearlyTrendChart expenses={filteredExpenses} />
            </div>

            <div className="mt-10 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Yearly Expenses by Category
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Compare category-wise spending across different years.
              </p>

              <YearlyCategoryChart expenses={filteredExpenses} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
