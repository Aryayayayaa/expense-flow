"use client";

import { useState } from "react";

import AddExpenseForm from "./AddExpenseForm";

import { SerializedExpense } from "../types";
//import type { OcrResult } from "../types/ocr";

export default function NewExpensePageClient() {
  const [editingExpense, setEditingExpense] =
    useState<SerializedExpense | null>(null);

  //const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AddExpenseForm
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
        // ocrResult={ocrResult}
      />
    </div>
  );
}
