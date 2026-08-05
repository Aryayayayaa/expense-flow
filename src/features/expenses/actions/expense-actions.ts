"use server";

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/features/expenses/lib/expenses";
import { revalidatePath } from "next/cache";

("use server");

export async function createExpenseAction(formData: FormData) {
  try {
    const title = String(formData.get("title"));
    if (!title.trim()) {
      throw new Error("Title is required");
    }
    const amount = Number(formData.get("amount"));
    const category = String(formData.get("category"));
    await createExpense({
      title,
      amount,
      category,
    });
    revalidatePath("/expenses");
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
    };
  }
}

export async function updateExpenseAction(id: number, formData: FormData) {
  const title = String(formData.get("title"));
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category"));
  await updateExpense(id, {
    title,
    amount,
    category,
  });
  revalidatePath("/expenses");
}

export async function deleteExpenseAction(id: number) {
  await deleteExpense(id);
  revalidatePath("/expenses");
}
