"use client";

import Button from "@/components/common/Button";

type DeleteExpenseDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteExpenseDialog({
  open,
  onCancel,
  onConfirm,
}: DeleteExpenseDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          Delete Expense
        </h2>

        <p className="mt-3 text-gray-600">
          Are you sure you want to delete this expense?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}