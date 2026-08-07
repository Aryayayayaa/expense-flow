import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ExpenseFlow",
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl bg-white/80 p-10 shadow-xl backdrop-blur-sm">
        <h1
          className="mb-4 text-4xl font-bold text-center"
          style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.5)" }}
        >
          💰 ExpenseFlow
        </h1>

        <p className="text-center text-gray-700" style={{ fontWeight: "bold" }}>
          Welcome to ExpenseFlow
        </p>

        <p className="mt-2 text-center text-gray-500">
          Manage your expenses efficiently.
        </p>
      </div>
    </main>
  );
}
