"use client";

import { useState } from "react";

import { requestNameChangeAction } from "../actions/account-actions";

type Props = {
  currentName: string;
};

export default function NameChangeRequest({ currentName }: Props) {
  const [requestedName, setRequestedName] = useState("");
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofPath, setProofPath] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const result = await requestNameChangeAction(
        requestedName,
        reason,
        proofUrl || undefined,
        proofPath || undefined,
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);

      setRequestedName("");
      setReason("");
      setProofUrl("");
      setProofPath("");
    } catch (error) {
      console.error("Name change request error:", error);
      setError("Unable to submit name change request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Request Name Change
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your current name is{" "}
          <span className="font-medium text-slate-700">{currentName}</span>.
          Name changes require approval from another HR or Admin account.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="requested-name"
            className="text-sm font-medium text-slate-700"
          >
            Requested Name
          </label>

          <input
            id="requested-name"
            type="text"
            value={requestedName}
            onChange={(event) => setRequestedName(event.target.value)}
            required
            minLength={2}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="name-change-reason"
            className="text-sm font-medium text-slate-700"
          >
            Reason <span className="text-red-600">*</span>
          </label>

          <textarea
            id="name-change-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            rows={4}
            placeholder="Explain why you need to change your name."
            className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:text-slate-900"
          />

          <p className="mt-1 text-xs text-slate-500">
            A reason is required. Supporting proof is optional.
          </p>
        </div>

        <div>
          <label
            htmlFor="name-change-proof-url"
            className="text-sm font-medium text-slate-700"
          >
            Supporting Proof URL{" "}
            <span className="text-slate-400">(optional)</span>
          </label>

          <input
            id="name-change-proof-url"
            type="url"
            value={proofUrl}
            onChange={(event) => setProofUrl(event.target.value)}
            placeholder="https://..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:text-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="name-change-proof-path"
            className="text-sm font-medium text-slate-700"
          >
            Supporting Proof Path{" "}
            <span className="text-slate-400">(optional)</span>
          </label>

          <input
            id="name-change-proof-path"
            type="text"
            value={proofPath}
            onChange={(event) => setProofPath(event.target.value)}
            placeholder="Optional proof storage path"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:text-slate-900"
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
        disabled={submitting}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Name Change Request"}
      </button>
    </form>
  );
}
