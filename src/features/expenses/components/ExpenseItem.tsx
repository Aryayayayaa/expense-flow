import { deleteExpenseAction } from "@/features/expenses/actions/expense-actions";
import { Expense } from "@/features/expenses/types/expense";

export default function ExpenseItem({ expense }: { expense: Expense }) {
  const deleteAction = deleteExpenseAction.bind(null, expense.id);

  return (
    <form action={deleteAction}>
      <button type="submit">Delete</button>
    </form>
  );
}
