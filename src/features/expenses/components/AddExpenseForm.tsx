"use client";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  createExpenseAction,
  updateExpenseAction,
} from "../actions/expense-actions";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

import { DEFAULT_CATEGORIES } from "@/constants/categories";

import { Expense } from "@prisma/client";

type AddExpenseFormProps = {
  editingExpense: Expense | null;
  setEditingExpense: React.Dispatch<React.SetStateAction<Expense | null>>;
};

const initialState = {
  success: false,
  errors: {} as Record<string, string[]>,
  message: "",
};

export default function AddExpenseForm({
  editingExpense,
  setEditingExpense,
}: AddExpenseFormProps) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function resetForm() {
    setTitle("");
    setAmount("");
    setSelectedCategory("");
    setCustomCategory("");

    setExpenseDate(
      new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );

    setEditingExpense(null);
    formRef.current?.reset();
    setState(initialState);
  }

  useEffect(() => {
    if (!editingExpense) return;
    setState(initialState);

    setTitle(editingExpense.title);
    setAmount(String(editingExpense.amount));

    if (
      (DEFAULT_CATEGORIES as readonly string[]).includes(
        editingExpense.category,
      )
    ) {
      setSelectedCategory(editingExpense.category);
      setCustomCategory("");
    } else {
      setSelectedCategory("Other");
      setCustomCategory(editingExpense.category);
    }

    const date = new Date(
      editingExpense.expenseDate ?? editingExpense.createdAt,
    );

    setExpenseDate(
      new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [editingExpense]);

  return (
    <Card>
      <form
        ref={formRef}
        action={async (formData) => {
          setPending(true);

          let result;

          if (editingExpense) {
            result = await updateExpenseAction(editingExpense.id, formData);
          } else {
            result = await createExpenseAction(null, formData);
          }

          setState(result);

          if (result.success) {
            setTimeout(() => {
              resetForm();
            }, 1000);
          }

          setPending(false);
        }}
        className="space-y-5"
      >
        <div className="border-b pb-4">
          <h2 className="text-2xl font-semibold">
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {editingExpense
              ? "Modify the details below and save your changes."
              : "Record a new expense to keep track of your spending."}
          </p>
        </div>

        <div className="space-y-1">
          <label className="block mb-1">Title</label>

          <input
            disabled={pending}
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          {state.errors?.title && (
            <p className="text-red-500 text-sm">{state.errors.title[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block mb-1">Amount</label>

          <input
            disabled={pending}
            name="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          {state.errors?.amount && (
            <p className="text-red-500 text-sm">{state.errors.amount[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block mb-1">Category</label>
          <select
            disabled={pending}
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select Category</option>

            {DEFAULT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {selectedCategory === "Other" && (
            <div className="mt-4 space-y-1">
              <label className="mb-1 block">Enter Category</label>

              <input
                disabled={pending}
                name="customCategory"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. Photography"
              />
            </div>
          )}

          {state.errors?.category && (
            <p className="text-red-500 text-sm">{state.errors.category[0]}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Expense Date & Time</label>

          <input
            disabled={pending}
            name="expenseDate"
            type="datetime-local"
            value={
              expenseDate ||
              new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)
            }
            max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {pending
            ? "Saving..."
            : editingExpense
              ? "Update Expense"
              : "Save Expense"}
        </Button>

        {editingExpense && (
          <Button
            disabled={pending}
            type="button"
            variant="secondary"
            className="w-full"
            onClick={resetForm}
          >
            Cancel Editing
          </Button>
        )}

        {state.message && (
          <p
            className={`rounded p-3 ${
              state.success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>
    </Card>
  );
}
