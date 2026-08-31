"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SupportRequestStatusSelectProps = {
  requestId: number;
  currentStatus: string;
};

const statuses = ["NEW", "IN_PROGRESS", "AWAITING_INFO", "RESOLVED"] as const;

export default function SupportRequestStatusSelect({
  requestId,
  currentStatus,
}: SupportRequestStatusSelectProps) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [confirmResolveOpen, setConfirmResolveOpen] = useState(false);

  const [actionTaken, setActionTaken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function updateStatus(nextStatus: string, resolutionAction?: string) {
    setUpdating(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/contact-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          actionTaken: resolutionAction,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to update support request.");
      }

      setStatus(nextStatus);

      setResolveDialogOpen(false);
      setConfirmResolveOpen(false);

      router.refresh();
    } catch (error) {
      console.error("Support request update error:", error);

      setStatus(currentStatus);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update support request.",
      );
    } finally {
      setUpdating(false);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value;

    /*
     * NEW is only the initial state.
     * A request cannot move back to NEW.
     */
    if (nextStatus === "NEW") {
      return;
    }

    /*
     * RESOLVED requires:
     * 1. Action Taken
     * 2. Final confirmation
     */
    if (nextStatus === "RESOLVED") {
      setResolveDialogOpen(true);
      return;
    }

    void updateStatus(nextStatus);
  }

  return (
    <>
      <select
        value={status}
        onChange={handleChange}
        disabled={updating || currentStatus === "RESOLVED"}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {statuses.map((requestStatus) => (
          <option
            key={requestStatus}
            value={requestStatus}
            disabled={requestStatus === "NEW"}
          >
            {requestStatus.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      {/* ------------------------------------------------------ */}
      {/* STEP 1: Action Taken                                   */}
      {/* ------------------------------------------------------ */}

      {resolveDialogOpen && !confirmResolveOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Resolve Support Request
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Describe the action taken to resolve this support request.
            </p>

            <textarea
              value={actionTaken}
              onChange={(event) => setActionTaken(event.target.value)}
              rows={5}
              placeholder="Describe the action taken..."
              className="mt-5 w-full resize-none rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            {errorMessage && (
              <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setResolveDialogOpen(false);
                  setActionTaken("");
                  setErrorMessage("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!actionTaken.trim() || updating}
                onClick={() => {
                  setErrorMessage("");
                  setConfirmResolveOpen(true);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* STEP 2: Final confirmation                             */}
      {/* ------------------------------------------------------ */}

      {confirmResolveOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Confirm Resolution
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Is this support request finally resolved? Once confirmed, this
              decision cannot be changed.
            </p>

            {errorMessage && (
              <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={updating}
                onClick={() => setConfirmResolveOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Back
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  void updateStatus("RESOLVED", actionTaken.trim());
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Resolving..." : "Confirm Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
