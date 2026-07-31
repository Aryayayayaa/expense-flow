import type { Expense } from "@/types/expense";

type ExpenseListProps = {
  expenses: Expense[];
};

export default function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p>No expenses yet.</p>;
  }

  return (
    <ul>
      {expenses.map((expense) => (
        <li key={expense.id}>
          {expense.title} - ₹{expense.amount}
        </li>
      ))}
    </ul>
  );
}
