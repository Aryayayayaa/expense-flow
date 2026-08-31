"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import { createRoleRequestAction } from "../actions/role-request-actions";

type RoleVerificationRequestProps = {
  currentRole: "ADMIN" | "HR" | "EMPLOYEE";
};

export default function RoleVerificationRequest({
  currentRole,
}: RoleVerificationRequestProps) {
  const [requestedRole, setRequestedRole] = useState<"ADMIN" | "HR">("ADMIN");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (currentRole !== "EMPLOYEE") {
    return null;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setMessage("");
  }

  async function handleSubmit() {
    if (!file) {
      setMessage("Please upload proof before submitting.");
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

      const extension = extensionMap[file.type] ?? "bin";

      const safePath = `role-verification/${Date.now()}-proof.${extension}`;

      const blob = await upload(safePath, file, {
        access: "private",
        handleUploadUrl: "/api/role-verification/upload",
        clientPayload: JSON.stringify({
          purpose: "role-verification",
        }),
      });

      const result = await createRoleRequestAction(
        requestedRole,
        blob.url,
        blob.pathname,
      );

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setFile(null);
      setMessage("Role verification request submitted successfully.");
    } catch (error) {
      console.error("Role request submission error:", error);

      setMessage("Unable to submit role verification request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="text-xl font-semibold text-slate-900 dark:text-white">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Request Role Verification
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Submit proof if you need ADMIN or HR privileges.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Requested Role
          </label>

          <select
            value={requestedRole}
            onChange={(event) =>
              setRequestedRole(event.target.value as "ADMIN" | "HR")
            }
            disabled={submitting}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="HR">HR</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Verification Proof
          </label>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Upload a JPG, PNG, WEBP image, or PDF document.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="role-verification-file"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Choose Verification File
            </label>

            <input
              id="role-verification-file"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf,.docx,.doc"
              onChange={handleFileChange}
              className="sr-only"
            />

            {file && (
              <span className="max-w-full truncate text-sm text-slate-600 dark:text-slate-300">
                {file.name}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Verification Request"}
        </button>

        {message && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
