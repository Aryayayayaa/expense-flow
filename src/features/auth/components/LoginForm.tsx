// src/features/auth/components/LoginForm.tsx

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { loginUserAction } from "../actions/auth-actions";
import { AuthState } from "../types/auth";

const initialState: AuthState = {
  success: false,
  errors: {},
  message: "",
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginUserAction,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        setShowPassword(false);
      }}
      className="max-w-md space-y-4"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {state.errors?.email && (
          <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
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
            autoComplete="current-password"
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

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Logging in..." : "Login"}
      </button>

      {state.message && (
        <p
          className={`text-sm ${
            state.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
