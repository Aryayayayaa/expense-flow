"use client";

import { useState } from "react";
import { Calendar, Clock, Tag, Pencil, Trash2 } from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate, formatTime } from "@/utils/formatDate";
import { getCategoryColor } from "@/utils/categoryColor";

import { deleteExpenseAction } from "@/features/expenses/actions/expense-actions";
import { Expense } from "@prisma/client";

import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

type ExpenseCardProps = {
  expense: Expense;
  onEdit: (expense: Expense) => void;
};

export default function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  const deleteAction = deleteExpenseAction.bind(null, expense.id);
  //const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <Card className="flex min-h-60 flex-col">
      <div className="space-y-2">
        <h2 className="mb-3 text-3xl font-semibold break-words">
          {expense.title}
        </h2>

        <p className="text-2xl font-bold text-green-600 tracking-tight">
          {formatCurrency(expense.amount)}
        </p>
      </div>

      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(expense.category)}`}
      >
        <Tag size={16} />
        <span>{expense.category}</span>
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(expense.expenseDate ?? expense.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{formatTime(expense.expenseDate ?? expense.createdAt)}</span>
        </div>
      </div>

      <hr className="my-5 border-gray-200" />

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => onEdit(expense)}
        >
          <Pencil size={18} />
          Edit
        </Button>

        <form
          action={deleteAction}
          className="w-full"
          onSubmit={(e) => {
            if (!confirm("Are you sure you want to delete this expense?")) {
              e.preventDefault();
            }
          }}
        >
          <Button
            type="submit"
            variant="danger"
            className="w-full flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </Button>
        </form>
      </div>
    </Card>
  );
}
