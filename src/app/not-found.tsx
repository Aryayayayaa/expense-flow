import Link from "next/link";
import { AlertCircle, Grid2X2, Headphones } from "lucide-react";

import Button from "@/components/common/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-6">
      <div className="flex w-full max-w-[520px] flex-col items-center">
        {/* 404 Illustration */}
        <div className="relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-[#e4e7f5] bg-[#f1f4ff]">
          {/* Large faded 404 */}
          <span className="select-none text-[150px] font-bold leading-none tracking-[-0.08em] text-[#dfe4ff]">
            404
          </span>

          {/* Error notification */}
          <div className="absolute left-1/2 top-1/2 flex w-[212px] -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-md border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm">
            <AlertCircle
              className="h-6 w-6 shrink-0 text-red-500"
              strokeWidth={2}
            />

            <div className="leading-tight">
              <p className="text-sm font-semibold text-red-600">System Error</p>

              <p className="mt-0.5 text-xs text-gray-600">
                Destination unreachable
              </p>
            </div>
          </div>
        </div>

        {/* Page Not Found */}
        <h1 className="mt-7 text-center text-2xl font-bold tracking-tight text-slate-900">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-3 max-w-[410px] text-center text-sm leading-5 text-slate-600">
          The page you are looking for might have been removed,
          <br />
          had its name changed, or is temporarily unavailable. Let&apos;s
          <br />
          get you back on track.
        </p>

        {/* Actions */}
        <div className="mt-7 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-14 min-w-[148px] items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Grid2X2 className="mr-2 h-4 w-4" />

            <span>
              Return to
              <br />
              Dashboard
            </span>
          </Link>

          <Link
            href="/contact"
            className="flex h-14 min-w-[130px] items-center justify-center rounded-md border border-gray-200 bg-white px-5 text-sm font-medium text-slate-800 hover:bg-gray-50"
          >
            <Headphones className="mr-2 h-4 w-4" />

            <span>
              Contact
              <br />
              Support
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
