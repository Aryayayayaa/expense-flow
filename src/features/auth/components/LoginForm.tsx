"use client";

import { useActionState } from "react";
import { loginUserAction } from "../actions/auth-actions";
import { RegisterState } from "../types/auth";

const initialState: RegisterState = {
  success: false,
  errors: {},
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginUserAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      <h1 className="text-3xl font-bold">Login Page</h1>
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
        {pending ? "Logging in..." : "Login"}
      </button>

      {state.success && <p className="text-green-600">Login successful!</p>}
    </form>
  );
}
