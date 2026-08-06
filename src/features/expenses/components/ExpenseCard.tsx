"use client";

import { useState } from "react";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

import { deleteExpenseAction } from "@/features/expenses/actions/expense-actions";
import { Expense } from "@/features/expenses/types/expense";

import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import DeleteExpenseDialog from "@/components/dialogs/DeleteExpenseDialog";

export default function ExpenseCard({
  expense,
}: {
  expense: Expense;
}) {
  const deleteAction = deleteExpenseAction.bind(null, expense.id);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <Card className="flex min-h-60 flex-col">
      <div className="space-y-2">
          <h2 className="text-2xl font-bold break-words leading-tight">
              {expense.title}
          </h2>

          <p className="text-3xl font-bold text-green-600">
              {formatCurrency(expense.amount)}
          </p>
      </div>

      <p className="text-gray-600">
        Category: {expense.category}
      </p>

      <p className="text-sm text-gray-500">
        {formatDate(expense.createdAt)}
      </p>

      <div className="mt-4 flex gap-3">
        <Button
          type="button"
          variant="primary"
        >
          Edit
        </Button>

        <Button
          type="submit"
          variant="danger"
          onClick={() => setOpenDeleteDialog(true)}
        >
          Delete
        </Button>
      </div>
      
      <DeleteExpenseDialog
        open={openDeleteDialog}
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={async () => {
          await deleteAction();
          setOpenDeleteDialog(false);
        }}
      />
      
    </Card>
  );
}