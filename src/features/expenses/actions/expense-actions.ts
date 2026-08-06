"use server";
import { revalidatePath } from "next/cache";

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/features/expenses/lib/expenses";
import { expenseSchema } from "../schemas/expense-schema";
import { capitalize } from "@/utils/capitalize";

export async function createExpenseAction(prevState: unknown,formData: FormData) {
  try {
    const values = {
      title: capitalize(String(formData.get("title"))),
      amount: formData.get("amount"),
      category: capitalize(String(formData.get("category"))),
    };

    const result = expenseSchema.safeParse(values);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
        message: "",
      };
    }
    await createExpense(result.data);
    revalidatePath("/expenses");
    return {
      success: true,
      errors: {},
      message: "Expense created successfully.",
    };
  } catch(error) {
    console.error("Create Expense Error:");
    console.error(error);
    return {
      success: false,
      errors: {},
      message: "Unable to create expense.",
    };
  }
}

export async function updateExpenseAction(id: number, formData: FormData) {
  const values = {
    title: capitalize(String(formData.get("title"))),
    amount: formData.get("amount"),
    category: capitalize(String(formData.get("category"))),
  };

  const result = expenseSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  await updateExpense(id, result.data)
  revalidatePath("/expenses");
}

export async function deleteExpenseAction(id: number) {
  await deleteExpense(id);
  revalidatePath("/expenses");
}
