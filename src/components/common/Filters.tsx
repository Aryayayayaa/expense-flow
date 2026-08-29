"use client";

import CategoryFilter from "@/features/expenses/components/CategoryFilter";
import YearFilter from "@/features/expenses/components/YearFilter";
import MonthFilter from "@/features/expenses/components/MonthFilter";
import DateFilter from "@/features/expenses/components/DateFilter";

import {
  ApprovalStatusFilter,
  ReimbursementStatusFilter,
  type ExpenseApprovalStatus,
  type ExpenseReimbursementStatus,
} from "@/features/expenses/components/StatusFilters";

import CurrencyFilter from "@/components/common/CurrencyFilter";

import type { CurrencyFilter as CurrencyFilterValue } from "@/constants/currencies";

type FiltersProps = {
  selectedCurrency: CurrencyFilterValue;
  onCurrencyChange: (currency: CurrencyFilterValue) => void;

  approvalStatus: ExpenseApprovalStatus;
  onApprovalStatusChange: (status: ExpenseApprovalStatus) => void;

  reimbursementStatus: ExpenseReimbursementStatus;
  onReimbursementStatusChange: (status: ExpenseReimbursementStatus) => void;

  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];

  selectedYear: string;
  onYearChange: (year: string) => void;
  years: number[];

  selectedMonth: string;
  onMonthChange: (month: string) => void;

  dateFilter: string;
  onDateFilterChange: (value: string) => void;

  customStartDate: string;
  customEndDate: string;

  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;

  minDate: string;
  maxDate: string;

  disableDatePresets: boolean;

  title?: string;
  description?: string;

  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
};

export default function Filters({
  selectedCurrency,
  onCurrencyChange,

  approvalStatus,
  onApprovalStatusChange,

  reimbursementStatus,
  onReimbursementStatusChange,

  selectedCategory,
  onCategoryChange,
  categories,

  selectedYear,
  onYearChange,
  years,

  selectedMonth,
  onMonthChange,

  dateFilter,
  onDateFilterChange,

  customStartDate,
  customEndDate,

  onCustomStartDateChange,
  onCustomEndDateChange,

  minDate,
  maxDate,

  disableDatePresets,

  title = "Filter Expenses",
  description = "Filter your expenses by currency, status, category, and date.",

  hasActiveFilters = false,
  onClearFilters,
}: FiltersProps) {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>

          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <CurrencyFilter
            value={selectedCurrency}
            onChange={onCurrencyChange}
          />

          <ApprovalStatusFilter
            value={approvalStatus}
            onChange={onApprovalStatusChange}
          />

          <ReimbursementStatusFilter
            value={reimbursementStatus}
            onChange={onReimbursementStatusChange}
          />

          <CategoryFilter
            value={selectedCategory}
            onChange={onCategoryChange}
            categories={categories}
          />

          <YearFilter
            value={selectedYear}
            years={years}
            onChange={onYearChange}
          />

          <MonthFilter
            value={selectedMonth}
            selectedYear={selectedYear}
            onChange={onMonthChange}
          />

          <DateFilter
            value={dateFilter}
            onChange={onDateFilterChange}
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={onCustomStartDateChange}
            onEndDateChange={onCustomEndDateChange}
            minDate={minDate}
            maxDate={maxDate}
            disablePresets={disableDatePresets}
          />
        </div>
      </div>
    </div>
  );
}
