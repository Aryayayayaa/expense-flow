"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

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
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        errors: {},
        message: "Please login to create expenses.",
      };
    }

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

    //console.log("Parsed Data:", result.data);

    await createExpense({ ...result.data, userId: Number(session.user.id) });
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

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        errors: {},
        message: "Unauthorized.",
      };
    }

    await updateExpense(id, Number(session.user.id), result.data);

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
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  await deleteExpense(id, Number(session.user.id));
  revalidatePath("/expenses");
}
