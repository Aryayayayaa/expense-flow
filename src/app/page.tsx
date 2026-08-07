import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="max-w-2xl rounded-2xl bg-white p-10 text-center shadow-xl">
        <h1 className="text-5xl font-bold text-gray-900">💸 ExpenseFlow</h1>

        <p className="mt-4 text-lg text-gray-600">
          A modern expense management application built with Next.js, Prisma,
          PostgreSQL, and Tailwind CSS.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          {/* <Link
            href="/expenses"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Expenses
          </Link> */}

          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Register
          </Link>
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-gray-500">
          <p>Built with ❤️ using Next.js 16, Prisma & PostgreSQL.</p>
        </div>
      </div>
    </main>
  );
}
