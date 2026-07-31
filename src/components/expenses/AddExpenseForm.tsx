"use client";

import { useState } from "react";

export default function AddExpenseForm() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    onAddExpense(newExpense);

    alert("Expense Saved!");

    setTitle("");
    setAmount(0);
    setCategory("");
    setDate("");
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Keep all your inputs exactly as before */}

      <button type="submit">Save Expense</button>
    </form>
  );
}
