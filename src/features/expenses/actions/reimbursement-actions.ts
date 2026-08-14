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

export async function reimburseExpenseAction(
  expenseId: number,
): Promise<ReimbursementActionResult> {
  try {
    const hr = await requireHR();

    if (!hr.success) {
      return hr;
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

    if (expense.userId === hr.userId) {
      return {
        success: false,
        message: "You cannot reimburse your own expense.",
      };
    }

    if (expense.status !== "APPROVED") {
      return {
        success: false,
        message: "Only approved expenses can be reimbursed.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          status: "REIMBURSED",
          reimbursedAt: new Date(),
          reimbursedById: hr.userId,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId,
          actorId: hr.userId,
          action: "REIMBURSED",
          metadata: {
            previousStatus: "APPROVED",
            newStatus: "REIMBURSED",
          },
        },
      });
    });

    revalidatePath("/hr");
    revalidatePath("/expenses");
    revalidatePath("/approvals");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/analytics");

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
