import ExpenseCard from "./ExpenseCard";
import type { Expense } from "@/features/expenses/types/expense";
import EmptyState from "@/components/feedback/EmptyState";

type ExpenseListProps = {
  expenses: Expense[];
};

export default function ExpenseList({
  expenses,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Add your first expense to get started."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
        />
      ))}
    </div>
  );
}