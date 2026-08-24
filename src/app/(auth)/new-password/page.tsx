import Link from "next/link";
import { redirect } from "next/navigation";

import NewPasswordForm from "@/features/auth/components/NewPasswordForm";

export default async function NewPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
  }>;
}) {
  const params = await searchParams;

  const token = params.token?.trim();

  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Set New Password
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new password for your ExpenseFlow account.
        </p>

        <div className="mt-6">
          <NewPasswordForm token={token} />
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
