"use client";

import { useActionState } from "react";
import { registerUserAction } from "../actions/auth-actions";
import { AuthState } from "../types/auth";
import Link from "next/link";

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
    <form action={formAction} className="space-y-4 max-w-md">
      <div>
        <label>Name</label>

        <input type="text" name="name" className="border rounded p-2 w-full" />

        {state.errors?.name && (
          <p className="text-red-500 text-sm">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label>Email</label>

        <input
          type="email"
          name="email"
          className="border rounded p-2 w-full"
        />

        {state.errors?.email && (
          <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label>Password</label>

        <input
          type="password"
          name="password"
          className="border rounded p-2 w-full"
        />

        {state.errors?.password && (
          <p className="text-red-500 text-sm">{state.errors.password[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {pending ? "Registering..." : "Register"}
      </button>

      {state.success && (
        <p className="text-green-600">Registration successful!</p>
      )}
    </form>
  );
}
