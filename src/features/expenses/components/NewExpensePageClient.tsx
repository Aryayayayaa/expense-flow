"use client";

import { useState } from "react";

import AddExpenseForm from "./AddExpenseForm";

import { SerializedExpense } from "../types";

export default function NewExpensePageClient() {
  const [editingExpense, setEditingExpense] =
    useState<SerializedExpense | null>(null);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AddExpenseForm
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
      />
    </div>
  );
}