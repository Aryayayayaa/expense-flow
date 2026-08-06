"use client";

import { useActionState } from "react";
import { createExpenseAction } from "../actions/expense-actions";
import Button from "@/components/common/Button";

const initialState = {
  success: false,
  errors: {} as Record<string, string[]>,
  message: "",
};

export default function AddExpenseForm() {
  const [state, formAction, pending] = useActionState(
    createExpenseAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 border rounded p-6">
      <div>
        <label className="block mb-1">Title</label>

        <input
          name="title"
          type="text"
          className="border rounded p-2 w-full"
        />

        {state.errors?.title && (
          <p className="text-red-500 text-sm">
            {state.errors.title[0]}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1">Amount</label>

        <input
          name="amount"
          type="number"
          step="0.01"
          className="border rounded p-2 w-full"
        />

        {state.errors?.amount && (
          <p className="text-red-500 text-sm">
            {state.errors.amount[0]}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1">Category</label>

        <input
          name="category"
          type="text"
          className="border rounded p-2 w-full"
        />

        {state.errors?.category && (
          <p className="text-red-500 text-sm">
            {state.errors.category[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {pending ? "Saving..." : "Save Expense"}
      </Button>

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
  );
}