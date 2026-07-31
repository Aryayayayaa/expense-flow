"use client";

import { createContext } from "react";

export type ExpenseContextType = {
  expenses: [];
};

export const ExpenseContext = createContext<ExpenseContextType | null>(null);
