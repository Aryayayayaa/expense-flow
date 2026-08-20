"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
  createExpense,
  deleteExpense,
  deleteExpenseAsAdmin,
  getExpense,
  getExpenseForAdmin,
  updateExpense,
  updateExpenseAsAdmin,
} from "@/features/expenses/lib/expenses";
import { getExchangeRate } from "@/features/expenses/lib/exchange-rates";

import { expenseSchema } from "../schemas/expense-schema";

import { createExpenseAuditLog } from "@/features/expenses/lib/expense-audit";
import { createNotification } from "@/features/notifications/lib/notifications";

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
  const actionStart = performance.now();

  try {
    /* ------------------------------------------------------------------ */
    /* Auth                                                               */
    /* ------------------------------------------------------------------ */

    const authStart = performance.now();

    const session = await auth();

    console.log(
      `[Expense Performance] auth: ${(performance.now() - authStart).toFixed(2)}ms`,
    );

    if (!session?.user?.id) {
      return {
        success: false,
        errors: {},
        message: "Please login to create expenses.",
        expenseId: undefined,
      };
    }

    /* ------------------------------------------------------------------ */
    /* Form processing + validation                                       */
    /* ------------------------------------------------------------------ */

    const validationStart = performance.now();

    const selectedCategory = String(formData.get("category"));

    const customCategory = String(formData.get("customCategory") ?? "").trim();

    const category =
      selectedCategory === "Other"
        ? capitalize(customCategory)
        : capitalize(selectedCategory);

    const expenseDate = formData.get("expenseDate");

    const currency = String(formData.get("currency") ?? "INR")
      .trim()
      .toUpperCase();

    const values = {
      title: capitalize(String(formData.get("title"))),
      amount: formData.get("amount"),
      currency,
      category,
      expenseDate,
    };

    const result = expenseSchema.safeParse(values);

    console.log(
      `[Expense Performance] validation: ${(performance.now() - validationStart).toFixed(2)}ms`,
    );

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
        message: "",
        expenseId: undefined,
      };
    }

    /* ------------------------------------------------------------------ */
    /* Exchange rate                                                      */
    /* ------------------------------------------------------------------ */

    const exchangeRateStart = performance.now();

    const exchangeRateResult = await getExchangeRate(currency, "INR");

    console.log(
      `[Expense Performance] exchange rate: ${(performance.now() - exchangeRateStart).toFixed(2)}ms`,
    );

    const baseCurrencyAmount = result.data.amount * exchangeRateResult.rate;

    /* ------------------------------------------------------------------ */
    /* Create expense                                                     */
    /* ------------------------------------------------------------------ */

    const expenseCreateStart = performance.now();

    const expense = await createExpense({
      ...result.data,
      userId: Number(session.user.id),
      currency,
      baseCurrencyAmount,
      exchangeRate: exchangeRateResult.rate,
      exchangeRateAt: exchangeRateResult.rateDate,
    });

    /* ------------------------------------------------------------------ */
    /* Create audit log                                                   */
    /* ------------------------------------------------------------------ */

    const auditStart = performance.now();

    await createExpenseAuditLog({
      expenseId: expense.id,
      actorId: Number(session.user.id),
      action: "CREATED",
    });

    console.log(
      `[Expense Performance] audit log: ${(performance.now() - auditStart).toFixed(2)}ms`,
    );

    /* ------------------------------------------------------------------ */
    /* Find reviewers                                                     */
    /* ------------------------------------------------------------------ */

    const reviewersStart = performance.now();

    const reviewers = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "HR"],
        },
      },

      select: {
        id: true,
      },
    });

    console.log(
      `[Expense Performance] reviewer lookup: ${(performance.now() - reviewersStart).toFixed(2)}ms`,
    );

    /* ------------------------------------------------------------------ */
    /* Create notifications                                               */
    /* ------------------------------------------------------------------ */

    const notificationsStart = performance.now();

    await Promise.all(
      reviewers.map((reviewer) =>
        createNotification({
          userId: reviewer.id,
          type: "EXPENSE_SUBMITTED",
          title: "New Expense Submitted",
          message: `A new expense "${expense.title}" has been submitted for review.`,
          expenseId: expense.id,
          metadata: {
            expenseTitle: expense.title,
            amount: Number(expense.amount),
            category: expense.category,
            submittedById: Number(session.user.id),
          },
        }),
      ),
    );

    console.log(
      `[Expense Performance] notifications: ${(performance.now() - notificationsStart).toFixed(2)}ms`,
    );

    /* ------------------------------------------------------------------ */
    /* Revalidate                                                         */
    /* ------------------------------------------------------------------ */

    const revalidateStart = performance.now();

    revalidatePath("/expenses");

    console.log(
      `[Expense Performance] revalidate: ${(performance.now() - revalidateStart).toFixed(2)}ms`,
    );

    /* ------------------------------------------------------------------ */
    /* Total                                                              */
    /* ------------------------------------------------------------------ */

    console.log(
      `[Expense Performance] total: ${(performance.now() - actionStart).toFixed(2)}ms`,
    );

    return {
      success: true,
      errors: {},
      message: "Expense created successfully.",
      expenseId: expense.id,
    };
  } catch (error) {
    console.error("Create Expense Error:");
    console.error(error);

    console.log(
      `[Expense Performance] failed after: ${(performance.now() - actionStart).toFixed(2)}ms`,
    );

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
      currency: String(formData.get("currency") ?? "INR").toUpperCase(),
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

    const currency = String(formData.get("currency") ?? "INR")
      .trim()
      .toUpperCase();

    const exchangeRateResult = await getExchangeRate(currency, "INR");

    const baseCurrencyAmount = result.data.amount * exchangeRateResult.rate;

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
    const role = session.user.role;

    let existingExpense;

    // ADMIN: Admins can edit any user's PENDING expense.

    if (role === "ADMIN") {
      existingExpense = await getExpenseForAdmin(id);
    } else {
      /*
       * EMPLOYEE / HR
       *
       * They can only edit their own expense.
       */
      existingExpense = await getExpense(id, userId);
    }

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

    const currencyData = {
      currency,
      baseCurrencyAmount,
      exchangeRate: exchangeRateResult.rate,
      exchangeRateAt: exchangeRateResult.rateDate,
    };

    const updatedExpense =
      role === "ADMIN"
        ? await updateExpenseAsAdmin(id, {
            ...result.data,
            ...currencyData,
          })
        : await updateExpense(id, userId, {
            ...result.data,
            ...currencyData,
          });

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

      /*
       * Notify the expense owner when an Admin or HR modifies
       * the expense.

       * Employees editing their own expense do not need to
       * receive a notification about their own modification.
       */
      if (
        (role === "ADMIN" || role === "HR") &&
        existingExpense.userId !== null
      ) {
        await createNotification({
          userId: existingExpense.userId,
          type: "EXPENSE_MODIFIED",
          title: "Expense Modified",
          message: `Your expense "${updatedExpense.title}" has been modified by ${
            role === "ADMIN" ? "Admin" : "HR"
          }.`,
          expenseId: updatedExpense.id,
          metadata: {
            expenseTitle: updatedExpense.title,
            changes,
            modifiedById: userId,
            modifiedByRole: role,
          },
        });
      }
    }

    revalidatePath("/expenses");
    revalidatePath("/approvals");

    return {
      success: true,
      errors: {},
      message:
        role === "ADMIN"
          ? "Expense updated successfully by Admin."
          : "Expense updated successfully.",
      expenseId: undefined,
    };
  } catch (error) {
    console.error("Update Expense Error:", error);

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

export async function deleteExpenseAsAdminAction(
  id: number,
  deletionReason: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Only Admins can delete expenses from the approval queue.",
      };
    }

    const reason = deletionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "Deletion reason is required.",
      };
    }

    await deleteExpenseAsAdmin(id, Number(session.user.id), reason);

    revalidatePath("/approvals");
    revalidatePath("/expenses");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Expense deleted successfully.",
    };
  } catch (error) {
    console.error("Admin Delete Expense Error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to delete expense.",
    };
  }
}
