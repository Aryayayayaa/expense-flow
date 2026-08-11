import Link from "next/link";
import RegisterForm from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            Expense<span className="text-blue-600">Flow</span>
          </Link>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start managing your expenses with ExpenseFlow.
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
