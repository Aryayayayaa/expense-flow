"use client";

import { useState } from "react";

import { updateOwnProfileAction } from "../actions/profile-actions";

type ProfileEditorProps = {
  name: string;
  email: string;
};

export default function ProfileEditor({
  name: initialName,
  email: initialEmail,
}: ProfileEditorProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");

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
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      setPassword("");
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
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
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
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
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
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
