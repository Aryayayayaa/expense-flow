"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  sendExpenseReimbursedEmail,
  sendReimbursementRejectedEmail,
} from "@/lib/email";

import { createNotification } from "@/features/notifications/lib/notifications";

type ReimbursementActionResult = {
  success: boolean;
  message: string;
};

type ReimbursementProcessor = {
  userId: number;
  role: "HR" | "ADMIN";
};

async function requireReimbursementProcessor() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      message: "Unauthorized.",
    };
  }

  if (session.user.role !== "HR" && session.user.role !== "ADMIN") {
    return {
      success: false as const,
      message: "You are not authorized to perform this action.",
    };
  }

  return {
    success: true as const,
    userId: Number(session.user.id),
    role: session.user.role,
  };
}

async function getReimbursementExpense(
  expenseId: number,
  processor: ReimbursementProcessor,
) {
  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },

    select: {
      id: true,
      title: true,
      amount: true,
      category: true,
      expenseDate: true,
      status: true,
      reimbursementStatus: true,
      reimbursementReason: true,
      userId: true,
      decidedById: true,

      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!expense) {
    return {
      success: false as const,
      message: "Expense not found.",
    };
  }

  if (expense.userId === processor.userId) {
    return {
      success: false as const,
      message: "You cannot process reimbursement for your own expense.",
    };
  }

  if (expense.status !== "APPROVED") {
    return {
      success: false as const,
      message: "Only approved expenses can be processed for reimbursement.",
    };
  }

  if (expense.reimbursementStatus !== "PENDING") {
    return {
      success: false as const,
      message: "This expense has already been processed for reimbursement.",
    };
  }

  /*
   * ------------------------------------------------------------------------
   * Admin approval/reimbursement separation
   * ------------------------------------------------------------------------
   *
   * An Admin cannot reimburse an expense that the same Admin approved.
   *
   * Other Admins and all authorized HR users remain eligible to reimburse.
   *
   * IMPORTANT:
   * This restriction is based on `decidedById` (the Admin who approved
   * the expense), NOT on who most recently modified the expense.
   */
  if (processor.role === "ADMIN" && expense.decidedById === processor.userId) {
    return {
      success: false as const,
      message:
        "You cannot reimburse an expense that you approved. Another Admin or HR must process the reimbursement.",
    };
  }

  return {
    success: true as const,
    expense,
  };
}

export async function reimburseExpenseAction(
  expenseId: number,
): Promise<ReimbursementActionResult> {
  try {
    const processor = await requireReimbursementProcessor();

    if (!processor.success) {
      return processor;
    }

    const expenseResult = await getReimbursementExpense(expenseId, {
      userId: processor.userId,
      role: processor.role,
    });

    if (!expenseResult.success) {
      return expenseResult;
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: {
          id: expenseId,
        },

        data: {
          reimbursementStatus: "REIMBURSED",
          reimbursementAt: new Date(),
          reimbursementById: processor.userId,
          reimbursementReason: null,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId,
          actorId: processor.userId,
          action: "REIMBURSED",
          metadata: {
            previousReimbursementStatus: "PENDING",
            newReimbursementStatus: "REIMBURSED",
          },
        },
      });
    });

    revalidateReimbursementPaths();

    if (expenseResult.expense.user) {
      await createNotification({
        userId: expenseResult.expense.userId!,
        type: "EXPENSE_REIMBURSED",
        title: "Expense Reimbursed",
        message: `Your expense "${expenseResult.expense.title}" has been reimbursed.`,
        expenseId: expenseResult.expense.id,
        metadata: {
          expenseTitle: expenseResult.expense.title,
          amount: Number(expenseResult.expense.amount),
          category: expenseResult.expense.category,
        },
      });

      await sendExpenseReimbursedEmail({
        employeeName: expenseResult.expense.user.name,
        employeeEmail: expenseResult.expense.user.email,
        expenseTitle: expenseResult.expense.title,
        amount: Number(expenseResult.expense.amount),
        category: expenseResult.expense.category,
        expenseDate: expenseResult.expense.expenseDate,
      });
    }

    return {
      success: true,
      message: "Expense marked as reimbursed successfully.",
    };
  } catch (error) {
    console.error("Reimburse Expense Error:", error);

    return {
      success: false,
      message: "Unable to mark expense as reimbursed.",
    };
  }
}

export async function rejectReimbursementAction(
  expenseId: number,
  rejectionReason: string,
): Promise<ReimbursementActionResult> {
  try {
    const processor = await requireReimbursementProcessor();

    if (!processor.success) {
      return processor;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "A reimbursement rejection reason is required.",
      };
    }

    const expenseResult = await getReimbursementExpense(expenseId, {
      userId: processor.userId,
      role: processor.role,
    });

    if (!expenseResult.success) {
      return expenseResult;
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: {
          id: expenseId,
        },

        data: {
          reimbursementStatus: "REJECTED",
          reimbursementAt: new Date(),
          reimbursementById: processor.userId,
          reimbursementReason: reason,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId,
          actorId: processor.userId,
          action: "REJECTED",
          reason,
          metadata: {
            previousReimbursementStatus: "PENDING",
            newReimbursementStatus: "REJECTED",
            reimbursementReason: reason,
          },
        },
      });
    });

    revalidateReimbursementPaths();

    if (expenseResult.expense.user) {
      await createNotification({
        userId: expenseResult.expense.userId!,
        type: "REIMBURSEMENT_REJECTED",
        title: "Reimbursement Rejected",
        message: `The reimbursement for your expense "${expenseResult.expense.title}" has been rejected.`,
        expenseId: expenseResult.expense.id,
        metadata: {
          expenseTitle: expenseResult.expense.title,
          amount: Number(expenseResult.expense.amount),
          category: expenseResult.expense.category,
          rejectionReason: reason,
        },
      });

      await sendReimbursementRejectedEmail({
        employeeName: expenseResult.expense.user.name,
        employeeEmail: expenseResult.expense.user.email,
        expenseTitle: expenseResult.expense.title,
        amount: Number(expenseResult.expense.amount),
        category: expenseResult.expense.category,
        expenseDate: expenseResult.expense.expenseDate,
        rejectionReason: reason,
      });
    }

    return {
      success: true,
      message: "Reimbursement rejected successfully.",
    };
  } catch (error) {
    console.error("Reject Reimbursement Error:", error);

    return {
      success: false,
      message: "Unable to reject reimbursement.",
    };
  }
}

function revalidateReimbursementPaths() {
  revalidatePath("/hr");
  revalidatePath("/expenses");
  revalidatePath("/approvals");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/analytics");
}
