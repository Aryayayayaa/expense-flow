"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Tag,
  Pencil,
  Trash2,
  ReceiptText,
  Eye,
  RefreshCw,
} from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate, formatTime } from "@/utils/formatDate";
import { getCategoryColor } from "@/utils/categoryColor";

import {
  deleteExpenseAction,
  removeBillProofAction,
} from "@/features/expenses/actions/expense-actions";
import { SerializedExpense } from "../types";

import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

import ReceiptUpload from "./ReceiptUpload";

type ExpenseCardProps = {
  expense: SerializedExpense;
  onEdit: (expense: SerializedExpense) => void;
};

export default function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  const deleteAction = deleteExpenseAction.bind(null, expense.id);
  //const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const removeBillProof = removeBillProofAction.bind(null, expense.id);
  const [showReplaceUpload, setShowReplaceUpload] = useState(false);

  return (
    <Card className="flex min-h-60 flex-col text-black">
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

      <div className="mt-4">
        {expense.billProofUrl ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <ReceiptText size={18} className="text-green-600" />

              <span className="font-medium text-green-800">
                Bill Proof Uploaded
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {/* View */}
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2"
                onClick={async () => {
                  const response = await fetch(
                    `/api/expenses/${expense.id}/bill-proof`,
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    alert(data.error ?? "Unable to open bill proof.");
                    return;
                  }

                  window.open(data.url, "_blank");
                }}
              >
                <Eye size={16} />
                View
              </Button>

              {/* Replace */}
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2"
                onClick={() => setShowReplaceUpload((value) => !value)}
              >
                <RefreshCw size={16} />
                {showReplaceUpload ? "Cancel Replace" : "Replace"}
              </Button>

              {/* Remove */}
              <form
                onSubmit={async (event) => {
                  event.preventDefault();

                  const confirmed = confirm(
                    "Are you sure you want to remove this bill proof?",
                  );

                  if (!confirmed) {
                    return;
                  }

                  const result = await removeBillProof();

                  if (!result.success) {
                    alert(result.message);
                  }
                }}
              >
                <Button
                  type="submit"
                  variant="danger"
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </Button>
              </form>
            </div>
            {showReplaceUpload && (
              <ReceiptUpload
                expenseId={expense.id}
                mode="replace"
                onUploadComplete={() => {
                  setShowReplaceUpload(false);
                }}
              />
            )}
          </div>
        ) : (
          <ReceiptUpload expenseId={expense.id} />
        )}
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
