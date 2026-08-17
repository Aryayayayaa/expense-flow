import Link from "next/link";

export default function AccountDisabledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <span className="text-2xl font-semibold">!</span>
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
          Account Deactivated
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your ExpenseFlow account has been deactivated and you no longer have
          access to the application.
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please contact HR or an administrator if you believe this was done in
          error.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Return to Login
        </Link>
      </div>
    </main>
  );
}
