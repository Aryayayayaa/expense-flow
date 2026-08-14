"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
  createExpense,
  deleteExpense,
  getExpense,
  updateExpense,
} from "@/features/expenses/lib/expenses";
import { expenseSchema } from "../schemas/expense-schema";

import { createExpenseAuditLog } from "@/features/expenses/lib/expense-audit";

import { capitalize } from "@/utils/capitalize";

type ExpenseActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  message: string;
  expenseId: number | undefined;
};

export async function createExpenseAction(
  prevState: unknown,
  formData: FormData,
): Promise<ExpenseActionState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        errors: {},
        message: "Please login to create expenses.",
        expenseId: undefined,
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
        expenseId: undefined,
      };
    }

    //console.log("Parsed Data:", result.data);

    const expense = await createExpense({
      ...result.data,
      userId: Number(session.user.id),
    });

    await createExpenseAuditLog({
      expenseId: expense.id,
      actorId: Number(session.user.id),
      action: "CREATED",
    });

    revalidatePath("/expenses");

    return {
      success: true,
      errors: {},
      message: "Expense created successfully.",
      expenseId: expense.id,
    };
  } catch (error) {
    console.error("Create Expense Error:");
    console.error(error);
    return {
      success: false,
      errors: {},
      message: "Unable to create expense.",
      expenseId: undefined,
    };
  }
}

export async function saveOcrReceiptAction(
  expenseId: number,
  ocrReceiptUrl: string,
  ocrReceiptPath: string,
  ocrRawText: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: Number(session.user.id),
      },
    });

    if (!expense) {
      return {
        success: false,
        message: "Expense not found.",
      };
    }

    // OCR receipt is immutable.
    // Never overwrite an existing OCR receipt.
    if (expense.ocrReceiptUrl || expense.ocrReceiptPath) {
      return {
        success: false,
        message: "An original OCR receipt already exists for this expense.",
      };
    }

    await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        ocrReceiptUrl,
        ocrReceiptPath,
        ocrRawText,
      },
    });

    revalidatePath("/expenses");

    return {
      success: true,
      message: "Original receipt saved successfully.",
    };
  } catch (error) {
    console.error("Save OCR Receipt Error:", error);

    return {
      success: false,
      message: "Unable to save original receipt.",
    };
  }
}

export async function updateExpenseAction(
  id: number,
  formData: FormData,
): Promise<ExpenseActionState> {
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
        expenseId: undefined,
      };
    }

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        errors: {},
        message: "Unauthorized.",
        expenseId: undefined,
      };
    }

    const userId = Number(session.user.id);

    const existingExpense = await getExpense(id, userId);

    if (!existingExpense) {
      return {
        success: false,
        errors: {},
        message: "Expense not found.",
        expenseId: undefined,
      };
    }

    if (existingExpense.status !== "PENDING") {
      return {
        success: false,
        errors: {},
        message: "Only pending expenses can be edited.",
        expenseId: undefined,
      };
    }

    const updatedExpense = await updateExpense(id, userId, result.data);

    const changes: Record<
      string,
      {
        from: string | number | null;
        to: string | number | null;
      }
    > = {};

    if (existingExpense.title !== updatedExpense.title) {
      changes.title = {
        from: existingExpense.title,
        to: updatedExpense.title,
      };
    }

    if (Number(existingExpense.amount) !== Number(updatedExpense.amount)) {
      changes.amount = {
        from: Number(existingExpense.amount),
        to: Number(updatedExpense.amount),
      };
    }

    if (existingExpense.category !== updatedExpense.category) {
      changes.category = {
        from: existingExpense.category,
        to: updatedExpense.category,
      };
    }

    const oldDate = existingExpense.expenseDate?.toISOString() ?? null;
    const newDate = updatedExpense.expenseDate?.toISOString() ?? null;

    if (oldDate !== newDate) {
      changes.expenseDate = {
        from: oldDate,
        to: newDate,
      };
    }

    if (Object.keys(changes).length > 0) {
      await createExpenseAuditLog({
        expenseId: updatedExpense.id,
        actorId: userId,
        action: "UPDATED",
        metadata: {
          changes,
        },
      });
    }

    revalidatePath("/expenses");

    return {
      success: true,
      errors: {},
      message: "Expense updated successfully.",
      expenseId: undefined,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      errors: {},
      message: "Unable to update expense.",
      expenseId: undefined,
    };
  }
}

export async function deleteExpenseAction(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  const expense = await getExpense(id, userId);

  if (!expense) {
    throw new Error("Expense not found.");
  }

  if (expense.status !== "PENDING") {
    throw new Error("Only pending expenses can be deleted.");
  }

  await deleteExpense(id, userId);

  revalidatePath("/expenses");
}

export async function saveBillProofAction(
  expenseId: number,
  billProofUrl: string,
  billProofPath: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: Number(session.user.id),
      },
    });

    if (!expense) {
      return {
        success: false,
        message: "Expense not found.",
      };
    }

    /*
     * An OCR receipt already satisfies the proof requirement.
     * Do not allow a second proof to be attached by the employee.
     */
    if (expense.ocrReceiptUrl || expense.ocrReceiptPath) {
      return {
        success: false,
        message: "This expense already has an original receipt attached.",
      };
    }

    /*
     * Bill proof is immutable once uploaded.
     */
    if (expense.billProofUrl || expense.billProofPath) {
      return {
        success: false,
        message: "Bill proof has already been uploaded and cannot be replaced.",
      };
    }

    await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        billProofUrl,
        billProofPath,
      },
    });

    revalidatePath("/expenses");

    return {
      success: true,
      message: "Bill proof saved successfully.",
    };
  } catch (error) {
    console.error("Save Bill Proof Error:", error);

    return {
      success: false,
      message: "Unable to save bill proof.",
    };
  }
}
