"use client";

import { useState } from "react";

import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import SummaryCard from "./SummaryCard";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import SortFilter from "./SortFilter";
import YearFilter from "./YearFilter";
import DateFilter from "./DateFilter";

import { Expense } from "@prisma/client";

import { formatCurrency } from "@/utils/formatCurrency";

import { Wallet, Calendar, Folder } from "lucide-react";
import { match } from "assert";

type ExpensesPageClientProps = {
  expenses: Expense[];
};

export default function ExpensesPageClient({
  expenses,
}: ExpensesPageClientProps) {
  const years = [
    ...new Set(
      expenses.map((expense) =>
        (expense.expenseDate ?? expense.createdAt).getFullYear(),
      ),
    ),
  ].sort((a, b) => b - a);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedYear, setSelectedYear] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const categories = [...new Set(expenses.map((expense) => expense.category))];

  const filteredExpenses = expenses.filter((expense) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      expense.title.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "" || expense.category === selectedCategory;

    const expenseDate = expense.expenseDate ?? expense.createdAt;
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

    const startOfThisYear = new Date(now.getFullYear(), 0, 1);

    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    let matchesDate = true;

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
          expenseDate >= startOfThisYear &&
          expenseDate < new Date(now.getFullYear() + 1, 0, 1);
        break;

      case "custom": {
        if (!customStartDate || !customEndDate) {
          matchesDate = true;
          break;
        }

        const startDate = new Date(`${customStartDate}T00:00:00`);
        const endDate = new Date(`${customEndDate}T23:59:59.999`);

        matchesDate = expenseDate >= startDate && expenseDate <= endDate;

        break;
      }

      case "all":
      default:
        matchesDate = true;
    }

    const matchesYear =
      selectedYear === "" ||
      (expense.expenseDate ?? expense.createdAt).getFullYear() ===
        Number(selectedYear);

    return matchesSearch && matchesCategory && matchesYear && matchesDate;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return (
          new Date(a.expenseDate ?? a.createdAt).getTime() -
          new Date(b.expenseDate ?? b.createdAt).getTime()
        );

      case "highest":
        return Number(b.amount) - Number(a.amount);

      case "lowest":
        return Number(a.amount) - Number(b.amount);

      case "title-asc":
        return a.title.localeCompare(b.title);

      case "title-desc":
        return b.title.localeCompare(a.title);

      case "latest":
      default:
        return (
          new Date(b.expenseDate ?? b.createdAt).getTime() -
          new Date(a.expenseDate ?? a.createdAt).getTime()
        );
    }
  });

  const currentDate = new Date();

  const thisMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = expense.expenseDate ?? expense.createdAt;

      return (
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const totalCategories = new Set(expenses.map((expense) => expense.category))
    .size;

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

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<Wallet size={22} />}
        />

        <SummaryCard
          title="This Month"
          value={formatCurrency(thisMonthExpenses)}
          icon={<Calendar size={22} />}
        />

        <SummaryCard
          title="Categories"
          value={totalCategories}
          icon={<Folder size={22} />}
        />
      </div>

      <hr className="my-6" />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
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

        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          startDate={customStartDate}
          endDate={customEndDate}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
          minDate={minDate}
        />

        <SortFilter value={sortBy} onChange={setSortBy} />
      </div>

      <AddExpenseForm
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
      />

      <div className="mt-10">
        {sortedExpenses.length > 0 ? (
          <ExpenseList expenses={sortedExpenses} onEdit={setEditingExpense} />
        ) : (
          <div className="rounded-lg border bg-white p-8 text-center text-gray-500 shadow">
            No matching expenses found.
          </div>
        )}
      </div>
    </>
  );
}
