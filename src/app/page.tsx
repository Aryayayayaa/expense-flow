import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Expense<span className="text-blue-600">Flow</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:px-4"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-4"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-5xl flex-col items-center justify-center text-center">
          <div className="mb-5 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Simple expense management
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Manage your expenses
            <span className="block text-blue-600">without the hassle.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Submit expenses, track approval status, and stay on top of
            reimbursements — all in one simple place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
            >
              Create an Account
            </Link>

            <Link
              href="/login"
              className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            <Feature
              title="Submit Expenses"
              description="Add an expense and upload your receipt."
            />

            <Feature
              title="Track Approvals"
              description="Know whether your expense is pending, approved, or rejected."
            />

            <Feature
              title="Get Reimbursed"
              description="Track your expense until reimbursement is complete."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

type FeatureProps = {
  title: string;
  description: string;
};

function Feature({ title, description }: FeatureProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-left">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
