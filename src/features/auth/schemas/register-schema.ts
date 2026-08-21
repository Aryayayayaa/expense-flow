import { z } from "zod";

import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/constants/currencies";

const supportedCurrencyCodes = SUPPORTED_CURRENCIES.map(
  (currency) => currency.code,
);

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),

  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),

  defaultCurrency: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (currency) => supportedCurrencyCodes.includes(currency as never),
      "Please select a supported currency.",
    )
    .default(DEFAULT_CURRENCY),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
