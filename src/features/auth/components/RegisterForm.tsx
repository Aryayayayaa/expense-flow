"use client";

import { useState, useActionState } from "react";
import { registerUserAction } from "../actions/auth-actions";
import { AuthState } from "../types/auth";
import Link from "next/link";

import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  //type CurrencyCode,
} from "@/constants/currencies";

const initialState: AuthState = {
  success: false,
  errors: {} as Record<string, string[]>,
};

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, formAction, pending] = useActionState(
    registerUserAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={() => {
        setShowPassword(false);
        setShowConfirmPassword(false);
      }}
      className="max-w-md space-y-4"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700"
        >
          Name
        </label>

        <input
          id="name"
          type="text"
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {state.errors?.name && (
          <p className="text-sm text-red-500">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label>Email</label>

        <input
          id="email"
          type="email"
          name="email"
          defaultValue={state.values?.email ?? ""}
          className="w-full rounded border p-2"
        />

        {state.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 p-2 pr-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {state.errors?.password && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-slate-700"
        >
          Confirm Password
        </label>

        <div className="relative mt-1">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 p-2 pr-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        {state.errors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.confirmPassword[0]}
          </p>
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
