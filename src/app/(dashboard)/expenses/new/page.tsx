import NewExpensePageClient from "@/features/expenses/components/NewExpensePageClient";

export default function NewExpensePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          New Expense
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Record a new expense to keep track of your spending.
        </p>
      </div>

      <NewExpensePageClient />
    </main>
  );
}
