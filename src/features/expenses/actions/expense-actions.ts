"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteStoredReceipt } from "@/features/expenses/lib/receipt-storage";

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

import {
  createNotification,
  createNotifications,
} from "@/features/notifications/lib/notifications";

import { capitalize } from "@/utils/capitalize";

type ExpenseActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  message: string;
  expenseId: number | undefined;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type ExpenseChange = {
  from: string | number | null;
  to: string | number | null;
};

function formatExpenseChanges(changes: Record<string, ExpenseChange>) {
  const labels: Record<string, string> = {
    title: "Title",
    amount: "Amount",
    currency: "Currency",
    category: "Category",
    expenseDate: "Expense date",
  };

  return Object.entries(changes)
    .map(([field, change]) => {
      const label = labels[field] ?? field;

      const from =
        change.from === null || change.from === ""
          ? "Not set"
          : String(change.from);

      const to =
        change.to === null || change.to === "" ? "Not set" : String(change.to);

      return `${label}: ${from} → ${to}`;
    })
    .join("; ");
}

/* -------------------------------------------------------------------------- */
/* Create Expense                                                             */
/* -------------------------------------------------------------------------- */

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

    const selectedCategory = String(formData.get("category") ?? "");

    const customCategory = String(formData.get("customCategory") ?? "").trim();

    const category =
      selectedCategory === "Other"
        ? capitalize(customCategory)
        : capitalize(selectedCategory);

    const rawExpenseDate = String(formData.get("expenseDate") ?? "").trim();

    const expenseDate = rawExpenseDate;

    const currency = String(formData.get("currency") ?? "INR")
      .trim()
      .toUpperCase();

    const values = {
      title: capitalize(String(formData.get("title") ?? "")),
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
        message: "Please correct the highlighted fields.",
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

    console.log(
      `[Expense Performance] expense create: ${(performance.now() - expenseCreateStart).toFixed(2)}ms`,
    );

    /* ------------------------------------------------------------------ */
    /* Audit + reviewer lookup                                            */
    /* ------------------------------------------------------------------ */

    const auditStart = performance.now();
    const reviewersStart = performance.now();

    const [auditResult, reviewers] = await Promise.all([
      createExpenseAuditLog({
        expenseId: expense.id,
        actorId: Number(session.user.id),
        action: "CREATED",
      }).then((result) => {
        console.log(
          `[Expense Performance] audit log: ${(performance.now() - auditStart).toFixed(2)}ms`,
        );

        return result;
      }),

      prisma.user
        .findMany({
          where: {
            role: {
              in: ["ADMIN", "HR"],
            },
          },
          select: {
            id: true,
          },
        })
        .then((result) => {
          console.log(
            `[Expense Performance] reviewer lookup: ${(performance.now() - reviewersStart).toFixed(2)}ms`,
          );

          return result;
        }),
    ]);

    void auditResult;

    /* ------------------------------------------------------------------ */
    /* Create notifications                                               */
    /* ------------------------------------------------------------------ */

    const notificationsStart = performance.now();

    await createNotifications(
      reviewers.map((reviewer) => ({
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
      })),
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
      message:
        error instanceof Error ? error.message : "Unable to create expense.",
      expenseId: undefined,
    };
  }
}

/* -------------------------------------------------------------------------- */
/* OCR Receipt                                                                */
/* -------------------------------------------------------------------------- */

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

    const userId = Number(session.user.id);
    const role = session.user.role;

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        ocrReceiptUrl: true,
        ocrReceiptPath: true,
      },
    });

    if (!expense) {
      return {
        success: false,
        message: "Expense not found.",
      };
    }

    if (expense.status !== "PENDING") {
      return {
        success: false,
        message: "Only pending expenses can have their receipt updated.",
      };
    }

    if (role !== "ADMIN" && expense.userId !== userId) {
      return {
        success: false,
        message: "You are not authorized to update this expense receipt.",
      };
    }

    if (!ocrReceiptUrl.trim() || !ocrReceiptPath.trim()) {
      return {
        success: false,
        message: "A valid receipt is required.",
      };
    }

    const previousReceiptPath = expense.ocrReceiptPath;

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

    if (previousReceiptPath && previousReceiptPath !== ocrReceiptPath) {
      try {
        await deleteStoredReceipt(previousReceiptPath);
      } catch (error) {
        console.error("Delete Previous OCR Receipt Error:", error);
      }
    }

    await createExpenseAuditLog({
      expenseId,
      actorId: userId,
      action: "UPDATED",
      metadata: {
        receiptReplaced: Boolean(previousReceiptPath),
        previousReceiptPath,
        newReceiptPath: ocrReceiptPath,
      },
    });

    revalidatePath("/expenses");
    revalidatePath(`/expenses/${expenseId}`);
    revalidatePath("/approvals");

    return {
      success: true,
      message: previousReceiptPath
        ? "Receipt replaced successfully."
        : "Receipt saved successfully.",
    };
  } catch (error) {
    console.error("Save OCR Receipt Error:", error);

    return {
      success: false,
      message: "Unable to save receipt.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Update Expense                                                             */
/* -------------------------------------------------------------------------- */

export async function updateExpenseAction(
  id: number,
  formData: FormData,
): Promise<ExpenseActionState> {
  try {
    const selectedCategory = String(formData.get("category") ?? "");

    const customCategory = String(formData.get("customCategory") ?? "").trim();

    const category =
      selectedCategory === "Other"
        ? capitalize(customCategory)
        : capitalize(selectedCategory);

    const rawExpenseDate = String(formData.get("expenseDate") ?? "").trim();

    const values = {
      title: capitalize(String(formData.get("title") ?? "")),
      amount: formData.get("amount"),
      currency: String(formData.get("currency") ?? "INR").toUpperCase(),
      category,
      expenseDate: rawExpenseDate,
    };

    const result = expenseSchema.safeParse(values);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
        message: "Please correct the highlighted fields.",
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

    if (role === "ADMIN") {
      existingExpense = await getExpenseForAdmin(id);
    } else {
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

    const changes: Record<string, ExpenseChange> = {};

    const pendingReceiptUrl = String(
      formData.get("ocrReceiptUrl") ?? "",
    ).trim();

    const pendingReceiptPath = String(
      formData.get("ocrReceiptPath") ?? "",
    ).trim();

    const pendingReceiptRawText = String(formData.get("ocrRawText") ?? "");

    if (existingExpense.title !== result.data.title) {
      changes.title = {
        from: existingExpense.title,
        to: result.data.title,
      };
    }

    if (Number(existingExpense.amount) !== Number(result.data.amount)) {
      changes.amount = {
        from: Number(existingExpense.amount),
        to: Number(result.data.amount),
      };
    }

    if (existingExpense.currency !== currency) {
      changes.currency = {
        from: existingExpense.currency,
        to: currency,
      };
    }

    if (existingExpense.category !== result.data.category) {
      changes.category = {
        from: existingExpense.category,
        to: result.data.category,
      };
    }

    const oldDate = existingExpense.expenseDate?.toISOString() ?? null;

    const newDate = result.data.expenseDate?.toISOString() ?? null;

    if (oldDate !== newDate) {
      changes.expenseDate = {
        from: oldDate,
        to: newDate,
      };
    }

    const updatedExpense =
      role === "ADMIN"
        ? await updateExpenseAsAdmin(
            id,
            userId,
            {
              ...result.data,
              ...currencyData,
            },
            changes,
          )
        : await updateExpense(id, userId, {
            ...result.data,
            ...currencyData,
          });

    if (pendingReceiptUrl && pendingReceiptPath) {
      const receiptResult = await saveOcrReceiptAction(
        id,
        pendingReceiptUrl,
        pendingReceiptPath,
        pendingReceiptRawText,
      );

      if (!receiptResult.success) {
        return {
          success: false,
          errors: {},
          message: receiptResult.message,
          expenseId: undefined,
        };
      }
    }

    /*
     * Admin modifications are audited inside updateExpenseAsAdmin()
     * so that the expense update and audit record are created together.
     *
     * Employee/HR edits continue to use the existing audit behavior here.
     */
    if (role !== "ADMIN" && Object.keys(changes).length > 0) {
      await createExpenseAuditLog({
        expenseId: updatedExpense.id,
        actorId: userId,
        action: "UPDATED",
        metadata: {
          changes,
        },
      });
    }

    /* ------------------------------------------------------------------ */
    /* Notifications after Admin/HR modification                         */
    /* ------------------------------------------------------------------ */

    if (
      (role === "ADMIN" || role === "HR") &&
      existingExpense.userId !== null &&
      Object.keys(changes).length > 0
    ) {
      const formattedChanges = formatExpenseChanges(changes);

      /*
       * Notify the owner of the expense.
       *
       * The notification now explicitly tells the owner
       * what was changed.
       */
      await createNotification({
        userId: existingExpense.userId,
        type: "EXPENSE_MODIFIED",
        title: "Expense Modified",
        message: `Your expense "${updatedExpense.title}" was modified by ${
          role === "ADMIN" ? "Admin" : "HR"
        }. Changes: ${formattedChanges}.`,
        expenseId: updatedExpense.id,
        metadata: {
          expenseTitle: updatedExpense.title,
          changes,
          modifiedById: userId,
          modifiedByRole: role,
        },
      });
    }

    /* ------------------------------------------------------------------ */
    /* Notify other Admins after an Admin modification                   */
    /* ------------------------------------------------------------------ */

    if (role === "ADMIN" && Object.keys(changes).length > 0) {
      const formattedChanges = formatExpenseChanges(changes);

      /*
       * Every other Admin is notified.
       *
       * The Admin who performed the modification is explicitly excluded.
       *
       * This matches the approval rule:
       *
       * "The Admin who most recently modified the expense cannot
       * approve/reject/delete it. Another eligible Admin must perform
       * the action."
       */
      const otherAdmins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          id: {
            not: userId,
          },
        },
        select: {
          id: true,
        },
      });

      if (otherAdmins.length > 0) {
        await createNotifications(
          otherAdmins.map((admin) => ({
            userId: admin.id,
            type: "EXPENSE_MODIFIED",
            title: "Expense Modified — Review Required",
            message: `Admin ${session.user.name ?? "an Admin"} modified the expense "${updatedExpense.title}". Please review the changes before approving, rejecting, or deleting it. Changes: ${formattedChanges}.`,
            expenseId: updatedExpense.id,
            metadata: {
              expenseTitle: updatedExpense.title,
              changes,
              modifiedById: userId,
              modifiedByRole: role,
              reviewRequired: true,
            },
          })),
        );
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
      message:
        error instanceof Error ? error.message : "Unable to update expense.",
      expenseId: undefined,
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Delete Expense                                                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Admin Delete Expense                                                       */
/* -------------------------------------------------------------------------- */

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
