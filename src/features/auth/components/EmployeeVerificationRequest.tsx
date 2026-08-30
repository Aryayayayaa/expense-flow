"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import { createEmployeeVerificationAction } from "../actions/employee-verification-actions";

type VerificationStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

type Props = {
  requestId?: number;
  status: VerificationStatus;
  rejectionReason?: string | null;
  attemptCount?: number;
};

const MAX_VERIFICATION_ATTEMPTS = 5;

export default function EmployeeVerificationRequest({
  requestId,
  status,
  rejectionReason,
  attemptCount = 0,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewingProof, setViewingProof] = useState(false);
  const [message, setMessage] = useState("");

  const attemptsRemaining = Math.max(
    MAX_VERIFICATION_ATTEMPTS - attemptCount,
    0,
  );

  const hasReachedMaximumAttempts = attemptCount >= MAX_VERIFICATION_ATTEMPTS;

  const canSubmit =
    !hasReachedMaximumAttempts && status !== "APPROVED" && status !== "PENDING";

  async function handleViewProof() {
    if (!requestId) {
      setMessage("Verification proof is not available.");
      return;
    }

    setViewingProof(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/employee-verification/upload/${requestId}/proof`,
        {
          method: "GET",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        setMessage(data.error ?? "Unable to open verification proof.");
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Employee verification proof view error:", error);

      setMessage("Unable to open verification proof.");
    } finally {
      setViewingProof(false);
    }
  }

  async function handleSubmit() {
    if (!file) {
      setMessage("Please upload your identity or employment proof.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
      };

      const extension = extensionMap[file.type];

      if (!extension) {
        setMessage(
          "Unsupported file type. Please upload JPG, PNG, WEBP, or PDF.",
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setMessage("File size must be 10 MB or less.");
        return;
      }

      const safePath = `employee-verification/${Date.now()}-proof.${extension}`;

      const blob = await upload(safePath, file, {
        access: "private",
        handleUploadUrl: "/api/employee-verification/upload",
        clientPayload: JSON.stringify({
          purpose: "employee-verification",
        }),
      });

      const result = await createEmployeeVerificationAction(
        blob.url,
        blob.pathname,
      );

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setFile(null);
      setMessage("Identity verification request submitted successfully.");
    } catch (error) {
      console.error("Employee verification submission error:", error);

      setMessage("Unable to submit identity verification request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Identity Verification
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Verify your employee identity by submitting an approved identity or
          employment document.
        </p>
      </div>

      <div className="mt-6">
        {status === "PENDING" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-medium text-amber-800">Verification pending</p>

            <p className="mt-1 text-sm text-amber-700">
              HR or Admin is currently reviewing your submitted document.
            </p>
          </div>
        )}

        {status === "APPROVED" && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-800">Identity verified</p>

            <p className="mt-1 text-sm text-green-700">
              Your employee identity has been verified. No further identity
              verification is required.
            </p>
          </div>
        )}

        {status === "REJECTED" && !hasReachedMaximumAttempts && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">Verification rejected</p>

            {rejectionReason && (
              <p className="mt-1 text-sm text-red-700">
                Reason: {rejectionReason}
              </p>
            )}

            <p className="mt-3 text-sm text-red-700">
              You may submit another document.
            </p>

            <p className="mt-1 text-xs text-red-600">
              {attemptsRemaining} verification attempt
              {attemptsRemaining === 1 ? "" : "s"} remaining.
            </p>
          </div>
        )}

        {hasReachedMaximumAttempts && status !== "APPROVED" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">
              Maximum verification attempts reached
            </p>

            <p className="mt-1 text-sm text-red-700">
              You have used all {MAX_VERIFICATION_ATTEMPTS} identity
              verification attempts.
            </p>
          </div>
        )}

        {requestId && status !== "NOT_SUBMITTED" && (
          <div className="mt-5">
            <button
              type="button"
              onClick={handleViewProof}
              disabled={viewingProof}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {viewingProof ? "Opening proof..." : "View submitted proof"}
            </button>
          </div>
        )}

        {canSubmit && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Identity / Employment Proof
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Upload JPG, PNG, WEBP, or PDF. Maximum size: 10 MB.
              </p>

              <input
                type="file"
                accept="
                  image/jpg,
                  image/jpeg,
                  image/png,
                  image/webp,
                  application/pdf"
                disabled={submitting}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                }}
                className="mt-3 block w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-slate-700"
              />
            </div>

            {file && (
              <p className="text-sm text-slate-500 dark:text-slate-900">
                Selected: {file.name}
              </p>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Verification"}
            </button>

            <p className="text-xs text-slate-500">
              {attemptsRemaining} verification attempt
              {attemptsRemaining === 1 ? "" : "s"} remaining.
            </p>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
