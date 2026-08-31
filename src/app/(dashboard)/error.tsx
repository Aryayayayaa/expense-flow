"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-6">
      <div className="w-full max-w-[368px] rounded-md border border-[#d5d8e5] bg-white px-6 py-7">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[10px] bg-[#fff3f3]">
            <AlertTriangle className="h-7 w-7 text-red-600" strokeWidth={2} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-center text-xl font-semibold tracking-tight text-slate-900">
          Something went wrong.
        </h1>

        {/* Description */}
        <p className="mt-2 text-center text-sm leading-5 text-slate-600">
          An unexpected error occurred while processing your request.
          <br />
          Please try again in a few minutes.
        </p>

        {/* Actions */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          {/* Try Again */}
          <button
            type="button"
            onClick={reset}
            className="flex h-[51px] items-center justify-center rounded-[3px] bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </button>

          {/* Return to Dashboard */}
          <Link
            href="/dashboard"
            className="flex h-[51px] items-center justify-center rounded-[3px] border border-[#d1d5e0] bg-white px-3 text-center text-sm font-medium text-slate-800 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />

            <span>
              Return to
              <br />
              Dashboard
            </span>
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-6 border-t border-[#d5d8e5]" />

        {/* Technical Details */}
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="mt-3 flex w-full items-center text-left text-xs font-medium tracking-wide text-slate-600"
        >
          <ChevronRight
            className={`mr-1 h-3.5 w-3.5 transition-transform ${
              showDetails ? "rotate-90" : ""
            }`}
          />
          Technical Details
        </button>

        {/* Error Details */}
        {showDetails && (
          <div className="mt-3 rounded bg-slate-50 p-3">
            <p className="break-words text-xs leading-4 text-slate-600">
              {error.message || "An unknown error occurred."}
            </p>

            {error.digest && (
              <p className="mt-2 break-all text-[11px] text-slate-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
