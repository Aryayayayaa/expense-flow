// src/app/(auth)/forgot-password/page.tsx

import Link from "next/link";

import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Forgot Password
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter your registered email address and we will send you an OTP to
          reset your password.
        </p>

        <div className="mt-6">
          <ForgotPasswordForm />
        </div>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
