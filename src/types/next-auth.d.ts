import "next-auth";
import "next-auth/jwt";

import type { CurrencyCode } from "@/constants/currencies";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "ADMIN" | "HR" | "EMPLOYEE";
      defaultCurrency: CurrencyCode;
    };
  }

  interface User {
    role: "ADMIN" | "HR" | "EMPLOYEE";
    defaultCurrency: CurrencyCode;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "HR" | "EMPLOYEE";
    defaultCurrency?: CurrencyCode;
  }
}
