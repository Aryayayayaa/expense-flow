"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/common/Button";
import AppDialog from "@/components/common/AppDialog";
import EditExpenseDialog from "@/features/expenses/components/EditExpenseDialog";
import { deleteExpenseAction } from "@/features/expenses/actions/expense-actions";

type ExpenseDetailsActionsProps = {
  expense: {
    id: number;
    title: string;
    amount: number;
    currency: string;
    category: string;
    expenseDate: string | null;
    createdAt: string;
    ocrReceiptUrl: string | null;
    ocrReceiptPath: string | null;
  };
};

export default function ExpenseDetailsActions({
  expense,
}: ExpenseDetailsActionsProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!expense) {
    return null;
  }

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);

    try {
      await deleteExpenseAction(expense.id);

      setDeleteDialogOpen(false);

      router.push("/expenses");
      router.refresh();
    } catch (error) {
      console.error("Delete expense error:", error);

      setDeleteDialogOpen(false);

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete expense.",
      );

      setErrorDialogOpen(true);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setEditOpen(true)}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit Expense
        </Button>

        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Expense"}
        </button>
      </div>

      <EditExpenseDialog
        open={editOpen}
        expense={expense}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          router.refresh();
        }}
      />

      <AppDialog
        open={deleteDialogOpen}
        title="Delete Expense"
        description="Are you sure you want to delete this pending expense? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete Expense"
        cancelLabel="Cancel"
        loading={deleting}
        loadingLabel="Deleting Expense..."
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
          }
        }}
      />

      <AppDialog
        open={errorDialogOpen}
        title="Unable to Delete Expense"
        description={errorMessage}
        variant="error"
        confirmLabel="Close"
        showCancel={false}
        onConfirm={() => {
          setErrorDialogOpen(false);
          setErrorMessage("");
        }}
        onCancel={() => {
          setErrorDialogOpen(false);
          setErrorMessage("");
        }}
      />
    </>
  );
}
