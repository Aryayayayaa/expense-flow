"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReimbursementActionResult = {
  success: boolean;
  message: string;
};

async function requireHR() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      message: "Unauthorized.",
    };
  }

  if (session.user.role !== "HR") {
    return {
      success: false as const,
      message: "You are not authorized to perform this action.",
    };
  }

  return {
    success: true as const,
    userId: Number(session.user.id),
  };
}

async function getReimbursementExpense(expenseId: number, hrId: number) {
  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
    select: {
      id: true,
      status: true,
      reimbursementStatus: true,
      userId: true,
    },
  });

  if (!expense) {
    return {
      success: false as const,
      message: "Expense not found.",
    };
  }

  if (expense.userId === hrId) {
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

  return {
    success: true as const,
    expense,
  };
}

export async function reimburseExpenseAction(
  expenseId: number,
): Promise<ReimbursementActionResult> {
  try {
    const hr = await requireHR();

    if (!hr.success) {
      return hr;
    }

    const expenseResult = await getReimbursementExpense(expenseId, hr.userId);

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
          reimbursementById: hr.userId,
          reimbursementReason: null,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId,
          actorId: hr.userId,
          action: "REIMBURSED",
          metadata: {
            previousReimbursementStatus: "PENDING",
            newReimbursementStatus: "REIMBURSED",
          },
        },
      });
    });

    revalidateReimbursementPaths();

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
    const hr = await requireHR();

    if (!hr.success) {
      return hr;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "A reimbursement rejection reason is required.",
      };
    }

    const expenseResult = await getReimbursementExpense(expenseId, hr.userId);

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
          reimbursementById: hr.userId,
          reimbursementReason: reason,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId,
          actorId: hr.userId,
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
