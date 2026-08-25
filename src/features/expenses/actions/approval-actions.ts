"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  sendExpenseApprovedEmail,
  sendExpenseRejectedEmail,
} from "@/lib/email";

import {
  deleteExpenseAsAdmin,
  getLatestAdminModifierId,
} from "@/features/expenses/lib/expenses";

import { createNotification } from "@/features/notifications/lib/notifications";

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

/**
 * Prevents the Admin who most recently modified an expense
 * from approving or rejecting that same expense.
 *
 * IMPORTANT:
 * We only check the LATEST Admin modification.
 *
 * Example:
 *
 * Admin X modifies
 * Admin Y modifies
 * Admin X modifies again
 *
 * Latest modifier = Admin X
 *
 * X -> blocked
 * Y -> allowed
 *
 * This avoids permanently blocking every Admin who has
 * ever modified the expense.
 */
async function ensureAdminCanReviewExpense(
  expenseId: number,
  adminId: number,
): Promise<ApprovalActionResult | null> {
  const latestAdminModifierId = await getLatestAdminModifierId(expenseId);

  if (latestAdminModifierId === adminId) {
    return {
      success: false,
      message:
        "You cannot approve or reject an expense that you most recently modified. Another Admin must review it.",
    };
  }

  return null;
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
        title: true,
        amount: true,
        category: true,
        expenseDate: true,
        status: true,

        userId: true,

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

    /*
     * Task 4B:
     *
     * Only the most recent Admin modifier is prevented
     * from approving the expense.
     */
    const reviewRestriction = await ensureAdminCanReviewExpense(
      expenseId,
      admin.userId,
    );

    if (reviewRestriction) {
      return reviewRestriction;
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

    if (expense.user) {
      await createNotification({
        userId: expense.userId!,
        type: "EXPENSE_APPROVED",
        title: "Expense Approved",
        message: `Your expense "${expense.title}" has been approved by Admin.`,
        expenseId: expense.id,
        metadata: {
          expenseTitle: expense.title,
          amount: Number(expense.amount),
          category: expense.category,
        },
      });

      await sendExpenseApprovedEmail({
        employeeName: expense.user.name,
        employeeEmail: expense.user.email,
        expenseTitle: expense.title,
        amount: Number(expense.amount),
        category: expense.category,
        expenseDate: expense.expenseDate,
      });
    }

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
        title: true,
        amount: true,
        category: true,
        expenseDate: true,
        status: true,

        userId: true,

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

    /*
     * Task 4B:
     *
     * Only the most recent Admin modifier is prevented
     * from rejecting the expense.
     */
    const reviewRestriction = await ensureAdminCanReviewExpense(
      expenseId,
      admin.userId,
    );

    if (reviewRestriction) {
      return reviewRestriction;
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

    if (expense.user) {
      await createNotification({
        userId: expense.userId!,
        type: "EXPENSE_REJECTED",
        title: "Expense Rejected",
        message: `Your expense "${expense.title}" has been rejected by Admin.`,
        expenseId: expense.id,
        metadata: {
          expenseTitle: expense.title,
          amount: Number(expense.amount),
          category: expense.category,
          rejectionReason: reason,
        },
      });

      await sendExpenseRejectedEmail({
        employeeName: expense.user.name,
        employeeEmail: expense.user.email,
        expenseTitle: expense.title,
        amount: Number(expense.amount),
        category: expense.category,
        expenseDate: expense.expenseDate,
        rejectionReason: reason,
      });
    }

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

export async function deleteExpenseAsAdminAction(
  expenseId: number,
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
        message: "Only Admins can delete expenses.",
      };
    }

    const reason = deletionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "Deletion reason is required.",
      };
    }

    /*
     * deleteExpenseAsAdmin() performs the final Task 4B
     * latest-modifier validation server-side.
     */
    await deleteExpenseAsAdmin(expenseId, Number(session.user.id), reason);

    revalidatePath("/approvals");
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
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
