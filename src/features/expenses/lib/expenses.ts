import { Prisma, ReimbursementStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { AdminModification } from "../types";

export type ReimbursementHistoryExpense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  status: string;
  reimbursementStatus: ReimbursementStatus;
  reimbursementReason: string | null;
  expenseDate: Date | null;
  decidedAt: Date | null;
  reimbursementAt: Date | null;

  ocrReceiptUrl: string | null;
  ocrReceiptPath: string | null;

  billProofUrl: string | null;
  billProofPath: string | null;

  user: {
    id: number;
    name: string;
    email: string;
  } | null;

  decidedBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;

  reimbursementBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

export async function getExpenses(userId: number) {
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
    },

    include: {
      decidedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      reimbursementBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      auditLogs: {
        where: {
          action: "UPDATED",
          actor: {
            role: "ADMIN",
          },
        },

        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 1,
      },
    },

    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
  });

  return expenses.map((expense) => {
    const latestAdminModification = expense.auditLogs[0];

    let adminModification: AdminModification | null = null;

    if (latestAdminModification?.actor) {
      const metadata = latestAdminModification.metadata;

      let changes: AdminModification["changes"] = {};

      if (
        metadata &&
        typeof metadata === "object" &&
        !Array.isArray(metadata) &&
        "changes" in metadata
      ) {
        const metadataChanges = metadata.changes;

        if (
          metadataChanges &&
          typeof metadataChanges === "object" &&
          !Array.isArray(metadataChanges)
        ) {
          changes = metadataChanges as AdminModification["changes"];
        }
      }

      adminModification = {
        admin: latestAdminModification.actor,
        modifiedAt: latestAdminModification.createdAt,
        changes,
      };
    }

    return {
      ...expense,
      amount: Number(expense.amount),
      baseCurrencyAmount:
        expense.baseCurrencyAmount !== null
          ? Number(expense.baseCurrencyAmount)
          : null,
      exchangeRate:
        expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,
      adminModification,
    };
  });
}

export async function getExpense(id: number, userId: number) {
  return prisma.expense.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category: string;
  expenseDate: Date;
  userId: number;
  currency: string;
  baseCurrencyAmount: number;
  exchangeRate: number;
  exchangeRateAt: Date;
}) {
  console.log("Saving to Prisma:", data);

  return prisma.expense.create({
    data,
  });
}

export async function updateExpense(
  id: number,
  userId: number,
  data: Partial<{
    title: string;
    amount: number;
    currency: string;
    baseCurrencyAmount: number;
    exchangeRate: number;
    exchangeRateAt: Date;
    category: string;
    expenseDate: Date;
  }>,
) {
  const expense = await prisma.expense.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  if (expense.status !== "PENDING") {
    throw new Error("Only pending expenses can be edited.");
  }

  return prisma.expense.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteExpense(id: number, userId: number) {
  const expense = await getExpense(id, userId);

  if (!expense) {
    throw new Error("Expense not found.");
  }

  if (expense.status !== "PENDING") {
    throw new Error("Only pending expenses can be deleted.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.expenseAuditLog.create({
      data: {
        expenseId: expense.id,
        actorId: userId,
        action: "DELETED",
        metadata: {
          title: expense.title,
          amount: Number(expense.amount),
          category: expense.category,
          expenseDate: expense.expenseDate?.toISOString() ?? null,
        },
      },
    });

    return tx.expense.delete({
      where: {
        id: expense.id,
      },
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Admin Expense Functions                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Get all expenses for an administrator.
 *
 * This intentionally does not use userId because an admin needs
 * visibility across all employees' expenses.
 */
export async function getAllExpensesForAdmin() {
  return prisma.expense.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      decidedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
  });
}

//Get expenses that are currently waiting for admin approval.

export async function getPendingExpensesForAdmin(adminId: number) {
  const expenses = await prisma.expense.findMany({
    where: {
      status: "PENDING",
      userId: {
        not: adminId,
      },
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      decidedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      reimbursementBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },

    orderBy: [{ expenseDate: "asc" }, { createdAt: "asc" }],
  });

  return expenses.map((expense) => ({
    ...expense,

    amount: Number(expense.amount),

    baseCurrencyAmount:
      expense.baseCurrencyAmount !== null
        ? Number(expense.baseCurrencyAmount)
        : null,

    exchangeRate:
      expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,
  }));
}

export async function getExpenseApprovalHistory(
  page: number = 1,
  pageSize: number = 10,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const where: Prisma.ExpenseWhereInput = {
    decidedAt: {
      not: null,
    },
  };

  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        decidedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        decidedAt: "desc",
      },

      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.expense.count({
      where,
    }),
  ]);

  return {
    expenses,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

export async function getExpenseDeletionHistoryForAdmin(
  page: number = 1,
  pageSize: number = 10,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const [deletedExpenses, total] = await prisma.$transaction([
    prisma.deletedExpense.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        deletedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        deletedAt: "desc",
      },

      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.deletedExpense.count(),
  ]);

  return {
    expenses: deletedExpenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    })),

    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

/* -------------------------------------------------------------------------- */
/* Admin Expense Editing                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get a specific expense for Admin editing.
 *
 * Unlike getExpense(), this intentionally does not restrict the expense
 * by userId because an Admin can edit another user's pending expense.
 */
export async function getExpenseForAdmin(id: number) {
  return prisma.expense.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Update another user's pending expense as an Admin.
 *
 * The caller is responsible for verifying that the authenticated user
 * actually has the ADMIN role.
 */
export async function updateExpenseAsAdmin(
  id: number,
  data: Partial<{
    title: string;
    amount: number;
    currency: string;
    baseCurrencyAmount: number;
    exchangeRate: number;
    exchangeRateAt: Date;
    category: string;
    expenseDate: Date;
  }>,
) {
  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  if (expense.status !== "PENDING") {
    throw new Error("Only pending expenses can be edited.");
  }

  return prisma.expense.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteExpenseAsAdmin(
  id: number,
  adminId: number,
  deletionReason: string,
) {
  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  if (expense.status !== "PENDING") {
    throw new Error("Only pending expenses can be deleted.");
  }

  const reason = deletionReason.trim();

  if (!reason) {
    throw new Error("Deletion reason is required.");
  }

  if (expense.userId === null) {
    throw new Error("Expense has no associated user.");
  }

  const ownerId = expense.userId;

  return prisma.$transaction(async (tx) => {
    /*
     * Preserve the complete expense information before deleting
     * the original Expense record.
     */
    const deletedExpense = await tx.deletedExpense.create({
      data: {
        originalExpenseId: expense.id,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        expenseDate: expense.expenseDate,

        ocrReceiptUrl: expense.ocrReceiptUrl,
        ocrReceiptPath: expense.ocrReceiptPath,
        ocrRawText: expense.ocrRawText,

        billProofUrl: expense.billProofUrl,
        billProofPath: expense.billProofPath,

        deletionReason: reason,
        deletedById: adminId,
        userId: ownerId,
      },
    });

    /*
     * Keep the existing audit trail as well.
     */
    await tx.expenseAuditLog.create({
      data: {
        expenseId: expense.id,
        actorId: adminId,
        action: "DELETED",
        metadata: {
          deletionReason: reason,
          originalExpenseId: expense.id,
          deletedExpenseId: deletedExpense.id,
        },
      },
    });

    /*
     * Delete the original expense only after the historical
     * snapshot and audit record have been successfully created.
     */
    await tx.expense.delete({
      where: {
        id: expense.id,
      },
    });

    return deletedExpense;
  });
}

/* -------------------------------------------------------------------------- */
/* Deleted Expense History                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Get expenses deleted by an Admin that originally belonged to a user.
 *
 * This allows the employee/HR account to see that their expense was
 * removed and understand why it was deleted.
 */
export async function getDeletedExpensesForUser(userId: number) {
  const deletedExpenses = await prisma.deletedExpense.findMany({
    where: {
      userId,
    },

    include: {
      deletedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },

    orderBy: {
      deletedAt: "desc",
    },
  });

  return deletedExpenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));
}

//HR Reimbursement Functions

/**
 * Get approved expenses that are still waiting for HR reimbursement
 * processing.
 *
 * Expense approval and reimbursement are separate workflows:
 *
 * ExpenseStatus:
 *   PENDING -> APPROVED / REJECTED
 *
 * ReimbursementStatus:
 *   PENDING -> REIMBURSED / REJECTED
 */
export async function getApprovedExpensesForHR(hrId: number) {
  const expenses = await prisma.expense.findMany({
    where: {
      status: "APPROVED",

      reimbursementStatus: "PENDING",

      userId: {
        not: hrId,
      },
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      decidedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: [{ decidedAt: "asc" }, { createdAt: "asc" }],
  });

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));
}

/* -------------------------------------------------------------------------- */
/* Reimbursement History                                                      */
/* -------------------------------------------------------------------------- */

export async function getReimbursementHistory(
  page: number = 1,
  pageSize: number = 10,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const where = {
    reimbursementStatus: {
      in: ["REIMBURSED", "REJECTED"] satisfies ReimbursementStatus[],
    },

    reimbursementAt: {
      not: null,
    },
  };

  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        decidedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        reimbursementBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        reimbursementAt: "desc",
      },

      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.expense.count({
      where,
    }),
  ]);

  return {
    expenses: expenses.map(
      (expense): ReimbursementHistoryExpense => ({
        id: expense.id,
        title: expense.title,
        amount: Number(expense.amount),
        category: expense.category,
        status: expense.status,
        reimbursementStatus: expense.reimbursementStatus,
        reimbursementReason: expense.reimbursementReason,
        expenseDate: expense.expenseDate,
        decidedAt: expense.decidedAt,
        reimbursementAt: expense.reimbursementAt,

        ocrReceiptUrl: expense.ocrReceiptUrl,
        ocrReceiptPath: expense.ocrReceiptPath,

        billProofUrl: expense.billProofUrl,
        billProofPath: expense.billProofPath,

        user: expense.user,
        decidedBy: expense.decidedBy,
        reimbursementBy: expense.reimbursementBy,
      }),
    ),

    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}
