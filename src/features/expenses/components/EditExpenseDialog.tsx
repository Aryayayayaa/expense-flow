"use client";

import { Expense } from "@/features/expenses/types/expense";
import Button from "@/components/common/Button";

type EditExpenseDialogProps = {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
};

export default function EditExpenseDialog({
  open,
  expense,
  onClose,
}: EditExpenseDialogProps) {
  if (!open || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">Edit Expense</h2>

        <p className="mt-2 text-sm text-gray-500">
          Update the expense details.
        </p>

        <div className="mt-6 space-y-4">
          <input
            defaultValue={expense.title}
            className="w-full rounded-lg border px-3 py-2"
          />

          <input
            defaultValue={Number(expense.amount)}
            type="number"
            className="w-full rounded-lg border px-3 py-2"
          />

          <input
            defaultValue={expense.category}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
