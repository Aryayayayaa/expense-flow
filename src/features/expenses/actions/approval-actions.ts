"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { createExpenseAuditLog } from "@/features/expenses/lib/expense-audit";

type ApprovalActionResult = {
  success: boolean;
  message: string;
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      message: "Unauthorized.",
    };
  }

  if (session.user.role !== "ADMIN") {
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

export async function approveExpenseAction(
  expenseId: number,
): Promise<ApprovalActionResult> {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return admin;
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    });

    if (!expense) {
      return {
        success: false,
        message: "Expense not found.",
      };
    }

    if (expense.userId === admin.userId) {
      return {
        success: false,
        message: "You cannot approve your own expense.",
      };
    }

    if (expense.status !== "PENDING") {
      return {
        success: false,
        message: "Only pending expenses can be approved.",
      };
    }

    const decidedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          status: "APPROVED",
          decidedAt,
          decidedById: admin.userId,
          rejectionReason: null,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId,
          actorId: admin.userId,
          action: "APPROVED",
        },
      });
    });

    revalidatePath("/approvals");
    revalidatePath("/expenses");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Expense approved successfully.",
    };
  } catch (error) {
    console.error("Approve Expense Error:", error);

    return {
      success: false,
      message: "Unable to approve expense.",
    };
  }
}

export async function rejectExpenseAction(
  expenseId: number,
  rejectionReason: string,
): Promise<ApprovalActionResult> {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return admin;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "A rejection reason is required.",
      };
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    });

    if (!expense) {
      return {
        success: false,
        message: "Expense not found.",
      };
    }

    if (expense.userId === admin.userId) {
      return {
        success: false,
        message: "You cannot reject your own expense.",
      };
    }

    if (expense.status !== "PENDING") {
      return {
        success: false,
        message: "Only pending expenses can be rejected.",
      };
    }

    const decidedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          status: "REJECTED",
          decidedAt,
          decidedById: admin.userId,
          rejectionReason: reason,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId,
          actorId: admin.userId,
          action: "REJECTED",
          reason,
        },
      });
    });

    revalidatePath("/approvals");
    revalidatePath("/expenses");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Expense rejected successfully.",
    };
  } catch (error) {
    console.error("Reject Expense Error:", error);

    return {
      success: false,
      message: "Unable to reject expense.",
    };
  }
}
