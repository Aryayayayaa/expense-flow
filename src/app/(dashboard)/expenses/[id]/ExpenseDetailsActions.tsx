"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/common/Button";
import EditExpenseDialog from "@/features/expenses/components/EditExpenseDialog";

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

  if (!expense) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setEditOpen(true)}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Edit Expense
      </Button>

      <EditExpenseDialog
        open={editOpen}
        expense={expense}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
