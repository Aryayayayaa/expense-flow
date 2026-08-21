"use client";

import { useActionState } from "react";
import { registerUserAction } from "../actions/auth-actions";
import { AuthState } from "../types/auth";
import Link from "next/link";

import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/constants/currencies";

const initialState: AuthState = {
  success: false,
  errors: {} as Record<string, string[]>,
};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerUserAction,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label>Name</label>

        <input type="text" name="name" className="w-full rounded border p-2" />

        {state.errors?.name && (
          <p className="text-sm text-red-500">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label>Email</label>

        <input
          type="email"
          name="email"
          className="w-full rounded border p-2"
        />

        {state.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label>Password</label>

        <input
          type="password"
          name="password"
          className="w-full rounded border p-2"
        />

        {state.errors?.password && (
          <p className="text-sm text-red-500">{state.errors.password[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="default-currency" className="mb-1 block">
          Default Currency
        </label>

        <select
          id="default-currency"
          name="defaultCurrency"
          defaultValue={DEFAULT_CURRENCY}
          disabled={pending}
          className="w-full rounded border p-2"
        >
          {SUPPORTED_CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} — {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>

        {state.errors?.defaultCurrency && (
          <p className="text-sm text-red-500">
            {state.errors.defaultCurrency[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {pending ? "Registering..." : "Register"}
      </button>

      {state.success && (
        <p className="text-green-600">Registration successful!</p>
      )}

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
