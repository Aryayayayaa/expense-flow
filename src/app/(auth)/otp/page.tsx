// src/app/(auth)/otp/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

import OtpVerificationForm from "@/features/auth/components/OtpVerificationForm";

export default async function OtpPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
  }>;
}) {
  const params = await searchParams;

  const email = params.email?.trim().toLowerCase();

  if (!email) {
    redirect("/forgot-password");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Verify OTP</h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter the 6-digit OTP sent to:
        </p>

        <p className="mt-1 text-sm font-medium text-slate-900">{email}</p>

        <div className="mt-6">
          <OtpVerificationForm email={email} />
        </div>

        <Link
          href="/forgot-password"
          className="mt-6 block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Request a new OTP
        </Link>
      </div>
    </main>
  );
}
