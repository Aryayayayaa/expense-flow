"use client";

import { useContext } from "react";
import { ExpenseContext } from "@/context/ExpenseContext";

export function useExpenses() {
  const context = useContext(ExpenseContext);

  if (!context) {
    throw new Error("useExpenses must be used inside ExpenseProvider");
  }

  // equivalent to = const context = useContext(...);
  return context;
}
