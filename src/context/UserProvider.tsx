"use client";

import type { ReactNode } from "react";

import type { CurrencyCode } from "@/constants/currencies";
import { UserContext } from "./UserContext";

type UserProviderProps = {
  defaultCurrency: CurrencyCode;
  children: ReactNode;
};

export default function UserProvider({
  defaultCurrency,
  children,
}: UserProviderProps) {
  return (
    <UserContext.Provider value={{ defaultCurrency }}>
      {children}
    </UserContext.Provider>
  );
}
