"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "../actions/password-reset-actions";

type Props = {
  token: string;
};

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export default function NewPasswordForm({ token }: Props) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="w-full max-w-md space-y-5">
      <input type="hidden" name="token" value={token} />

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          New Password
        </label>

        <input
          id="password"
          type="password"
          name="password"
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter new password"
        />

        {state.errors?.password?.[0] && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.password[0]}
          </p>
        )}

        <p className="mt-1 text-xs text-slate-500">
          Password must be at least 8 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Confirm Password
        </label>

        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Confirm new password"
        />

        {state.errors?.confirmPassword?.[0] && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Updating Password..." : "Set New Password"}
      </button>
    </form>
  );
}
