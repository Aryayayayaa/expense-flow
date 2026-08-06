import AddExpenseForm from "@/features/expenses/components/AddExpenseForm";
import ExpenseList from "@/features/expenses/components/ExpenseList";
import { getExpenses } from "@/features/expenses/lib/expenses";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <main className="mx-auto w-full max-w-screen-2xl p-6 space-y-8">
      <h1 className="text-3xl font-bold">
        Expenses
      </h1>

      <AddExpenseForm />

      <ExpenseList expenses={expenses} />
    </main>
  );
}