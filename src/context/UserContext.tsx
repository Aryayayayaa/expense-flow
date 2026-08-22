"use client";

import { createContext, useContext } from "react";

import type { CurrencyCode } from "@/constants/currencies";

type UserContextType = {
  defaultCurrency: CurrencyCode;
};

export const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}
