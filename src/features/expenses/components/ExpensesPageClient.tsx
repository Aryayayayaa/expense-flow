"use client";

import { useState } from "react";

import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import SummaryCard from "./SummaryCard";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import SortFilter from "./SortFilter";
import YearFilter from "./YearFilter";

import { Expense } from "@prisma/client";

import { formatCurrency } from "@/utils/formatCurrency";

import { Wallet, Calendar, Folder } from "lucide-react";

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

    const matchesYear =
      selectedYear === "" ||
      (expense.expenseDate ?? expense.createdAt).getFullYear() ===
        Number(selectedYear);

    return matchesSearch && matchesCategory && matchesYear;
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
