"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateOwnProfileAction } from "../actions/profile-actions";

import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/constants/currencies";

type ProfileEditorProps = {
  name: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  defaultCurrency?: string;
};

export default function ProfileEditor({
  name: initialName,
  email: initialEmail,
  role,
  defaultCurrency: initialDefaultCurrency,
}: ProfileEditorProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");

  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>(
    SUPPORTED_CURRENCIES.some(
      (currency) => currency.code === initialDefaultCurrency,
    )
      ? (initialDefaultCurrency as CurrencyCode)
      : DEFAULT_CURRENCY,
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      const result = await updateOwnProfileAction({
        name,
        email,
        password: password || undefined,
        defaultCurrency,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      setPassword("");

      /*
       * The server action updates:
       *
       * 1. Prisma User.defaultCurrency
       * 2. The current NextAuth JWT/session
       *
       * Refreshing the server component tree causes DashboardLayout
       * to call auth() again and provide the updated currency to
       * UserProvider.
       *
       * Therefore the user does NOT need to log out and log back in.
       */
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Edit Profile</h2>

        <p className="mt-1 text-sm text-slate-500">
          Update your account information.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="profile-name"
            className="text-sm font-medium text-slate-700"
          >
            Name
          </label>

          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={role === "EMPLOYEE" || role === "ADMIN"}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none focus:border-blue-500 dark:text-slate-900"
          />

          {(role === "EMPLOYEE" || role === "ADMIN") && (
            <p className="mt-2 text-xs text-slate-500">
              Name changes must be requested through HR.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="text-sm font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none focus:border-blue-500 dark:text-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="profile-default-currency"
            className="text-sm font-medium text-slate-700"
          >
            Default Currency
          </label>

          <select
            id="profile-default-currency"
            value={defaultCurrency}
            onChange={(event) =>
              setDefaultCurrency(event.target.value as CurrencyCode)
            }
            disabled={saving}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none focus:border-blue-500 dark:text-slate-900"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            This currency is used as your preferred currency throughout the
            application.
          </p>
        </div>

        <div>
          <label
            htmlFor="profile-password"
            className="text-sm font-medium text-slate-700"
          >
            New Password
          </label>

          <input
            id="profile-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Leave blank to keep current password"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none focus:border-blue-500 dark:text-slate-900"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
      )}

      {message && (
        <p className="mt-4 text-sm font-medium text-green-600">{message}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
