// src/features/auth/schemas/register-schema.ts

import { z } from "zod";

import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/constants/currencies";

const supportedCurrencyCodes = SUPPORTED_CURRENCIES.map(
  (currency) => currency.code,
);

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name is too long")
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        "Name can contain only letters and spaces.",
      ),

    email: z.email("Please enter a valid email address.").trim().toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password is too long."),

    confirmPassword: z.string().min(1, "Please confirm your password."),

    defaultCurrency: z
      .string()
      .trim()
      .toUpperCase()
      .refine(
        (currency) => supportedCurrencyCodes.includes(currency as never),
        "Please select a supported currency.",
      )
      .default(DEFAULT_CURRENCY),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
