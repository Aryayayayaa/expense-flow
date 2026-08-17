"use client";

import { useMemo, useState } from "react";

import CategoryFilter from "@/features/expenses/components/CategoryFilter";
import YearFilter from "@/features/expenses/components/YearFilter";
import MonthFilter from "@/features/expenses/components/MonthFilter";
import DateFilter from "@/features/expenses/components/DateFilter";

import OverviewSummaryCards from "@/features/analytics/components/OverviewSummaryCards";
import CategoryComparisonChart from "@/features/analytics/components/charts/CategoryComparisonChart";

import ReportSummary from "@/features/analytics/components/reports/ReportSummary";
import SpendingSummary from "@/features/analytics/components/reports/SpendingSummary";
import LargestExpenses from "@/features/analytics/components/reports/LargestExpenses";
import TopCategories from "@/features/analytics/components/reports/TopCategories";

import type { AnalyticsExpense } from "@/features/analytics/types";

type ReportsFiltersProps = {
  expenses: AnalyticsExpense[];
};

export default function ReportsFilters({ expenses }: ReportsFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

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

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = expense.expenseDate ?? expense.createdAt;

      const matchesCategory =
        selectedCategory === "" || expense.category === selectedCategory;

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

      return matchesCategory && matchesYear && matchesMonth && matchesDate;
    });
  }, [
    expenses,
    selectedCategory,
    selectedYear,
    selectedMonth,
    dateFilter,
    customStartDate,
    customEndDate,
  ]);

  const disableDatePresets =
    isMonthSelected || (isYearSelected && !isCurrentYearSelected);

  return (
    <>
      <div className="mb-6 rounded-lg border bg-gray-50 p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Filter Reports
        </h2>

        <div className="flex flex-col gap-4 lg:flex-row">
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

      <div className="space-y-6">
        <OverviewSummaryCards expenses={filteredExpenses} />

        <CategoryComparisonChart expenses={filteredExpenses} />

        <ReportSummary expenses={filteredExpenses} />

        <SpendingSummary expenses={filteredExpenses} />

        <LargestExpenses expenses={filteredExpenses} />

        <TopCategories expenses={filteredExpenses} />
      </div>
    </>
  );
}
