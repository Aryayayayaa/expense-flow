"use server";
import { revalidatePath } from "next/cache";

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/features/expenses/lib/expenses";
import { expenseSchema } from "../schemas/expense-schema";
import { capitalize } from "@/utils/capitalize";

export async function createExpenseAction(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const selectedCategory = String(formData.get("category"));
    const customCategory = String(formData.get("customCategory") ?? "").trim();
    const category =
      selectedCategory === "Other"
        ? capitalize(customCategory)
        : capitalize(selectedCategory);
    const expenseDate = formData.get("expenseDate");
    const values = {
      title: capitalize(String(formData.get("title"))),
      amount: formData.get("amount"),
      category,
      expenseDate,
    };
    const result = expenseSchema.safeParse(values);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
        message: "",
      };
    }

    console.log("Parsed Data:", result.data);

    await createExpense(result.data);
    revalidatePath("/expenses");
    return {
      success: true,
      errors: {},
      message: "Expense created successfully.",
    };
  } catch (error) {
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
  try {
    const selectedCategory = String(formData.get("category"));

    const customCategory = String(formData.get("customCategory") ?? "").trim();

    const category =
      selectedCategory === "Other"
        ? capitalize(customCategory)
        : capitalize(selectedCategory);

    const values = {
      title: capitalize(String(formData.get("title"))),
      amount: formData.get("amount"),
      category,
      expenseDate: formData.get("expenseDate"),
    };

    const result = expenseSchema.safeParse(values);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
        message: "",
      };
    }

    await updateExpense(id, result.data);

    revalidatePath("/expenses");

    return {
      success: true,
      errors: {},
      message: "Expense updated successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      errors: {},
      message: "Unable to update expense.",
    };
  }
}

export async function deleteExpenseAction(id: number) {
  await deleteExpense(id);
  revalidatePath("/expenses");
}
