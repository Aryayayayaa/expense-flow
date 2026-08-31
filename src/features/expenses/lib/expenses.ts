import { ExpenseStatus, Prisma, ReimbursementStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { AdminModification } from "../types";
import { getDisplayExpenseAmount } from "./display-currency";
import { CurrencyCode, DEFAULT_CURRENCY } from "@/constants/currencies";

import { createNotification } from "@/features/notifications/lib/notifications";

function serializeExpenseAmounts<
  T extends {
    amount: Prisma.Decimal;
    baseCurrencyAmount: Prisma.Decimal | null;
    exchangeRate: Prisma.Decimal | null;
  },
>(expense: T) {
  return {
    ...expense,
    amount: Number(expense.amount),
    baseCurrencyAmount:
      expense.baseCurrencyAmount !== null
        ? Number(expense.baseCurrencyAmount)
        : null,
    exchangeRate:
      expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,
  };
}

export type ReimbursementHistoryExpense = {
  id: number;
  title: string;
  amount: number;
  currency: string;
  baseCurrencyAmount: number | null;
  exchangeRate: number | null;
  category: string;
  status: string;
  reimbursementStatus: ReimbursementStatus;
  reimbursementReason: string | null;
  expenseDate: Date | null;
  decidedAt: Date | null;
  reimbursementAt: Date | null;

  ocrReceiptUrl: string | null;
  ocrReceiptPath: string | null;

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

export async function getExpenses(
  userId: number,
  page: number = 1,
  pageSize: number = 10,
  approvalStatus: ExpenseStatus | "ALL" = "ALL",
  reimbursementStatus: ReimbursementStatus | "ALL" = "ALL",
  defaultCurrency: CurrencyCode = DEFAULT_CURRENCY,
  paginate: boolean = true,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const where: Prisma.ExpenseWhereInput = {
    userId,

    ...(approvalStatus !== "ALL"
      ? {
          status: approvalStatus,
        }
      : {}),

    ...(reimbursementStatus !== "ALL"
      ? {
          reimbursementStatus,
        }
      : {}),
  };

  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where,

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

      ...(paginate
        ? {
            skip: (safePage - 1) * safePageSize,
            take: safePageSize,
          }
        : {}),
    }),

    prisma.expense.count({
      where,
    }),
  ]);

  const serializedExpenses = await Promise.all(
    expenses.map(async (expense) => {
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

      const amount = Number(expense.amount);

      const baseCurrencyAmount =
        expense.baseCurrencyAmount !== null
          ? Number(expense.baseCurrencyAmount)
          : null;

      const exchangeRate =
        expense.exchangeRate !== null ? Number(expense.exchangeRate) : null;

      const displayAmount = await getDisplayExpenseAmount(
        {
          amount,
          currency: expense.currency,
          baseCurrencyAmount,
          exchangeRate,
        },
        defaultCurrency,
      );

      return {
        ...expense,
        amount,
        baseCurrencyAmount,
        exchangeRate,
        displayAmount,
        adminModification,
      };
    }),
  );

  console.log(
    "RECEIPT DATA:",
    serializedExpenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      ocrReceiptUrl: expense.ocrReceiptUrl,
      ocrReceiptPath: expense.ocrReceiptPath,
    })),
  );

  return {
    expenses: serializedExpenses,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: paginate ? Math.ceil(total / safePageSize) : 1,
  };
}

export async function getAllExpensesForUser(
  userId: number,
  defaultCurrency: CurrencyCode = DEFAULT_CURRENCY,
) {
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

  return Promise.all(
    expenses.map(async (expense) => {
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

      const amount = Number(expense.amount);

      const baseCurrencyAmount =
        expense.baseCurrencyAmount !== null
          ? Number(expense.baseCurrencyAmount)
          : null;

      const exchangeRate =
        expense.exchangeRate !== null ? Number(expense.exchangeRate) : null;

      const displayAmount = await getDisplayExpenseAmount(
        {
          amount,
          currency: expense.currency,
          baseCurrencyAmount,
          exchangeRate,
        },
        defaultCurrency,
      );

      return {
        ...expense,
        amount,
        baseCurrencyAmount,
        exchangeRate,
        displayAmount,
        adminModification,
      };
    }),
  );
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
  const sessionStart = performance.now();

  console.log("Saving to Prisma:", data);

  console.log(
    `[Expense Performance] expense create: ${(performance.now() - sessionStart).toFixed(2)}ms`,
  );

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
  const expenses = await prisma.expense.findMany({
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

/* -------------------------------------------------------------------------- */
/* Admin Expense Functions                                                    */
/* -------------------------------------------------------------------------- */

export type AdminExpenseScope = "OWN" | "EMPLOYEES" | "HRS" | "OTHER_ADMINS";

export type ReimbursementExpenseScope =
  | "OWN"
  | "EMPLOYEES"
  | "OTHER_ADMINS"
  | "HRS"
  | "OTHER_HRS"
  | "ADMINS";

/**
 * Returns the Prisma owner filter for an Admin expense scope.
 *
 * OWN:
 *   Current Admin's own expenses.
 *
 * EMPLOYEES:
 *   Expenses belonging only to EMPLOYEE users.
 *
 * HRS:
 *   Expenses belonging only to HR users.
 *
 * OTHER_ADMINS:
 *   Expenses belonging to other ADMIN users.
 *
 * IMPORTANT:
 *   The current Admin is explicitly excluded from OTHER_ADMINS.
 */
function getAdminExpenseScopeFilter(
  adminId: number,
  scope: AdminExpenseScope,
): Prisma.ExpenseWhereInput {
  switch (scope) {
    case "OWN":
      return {
        userId: adminId,
      };

    case "EMPLOYEES":
      return {
        user: {
          role: "EMPLOYEE",
        },
      };

    case "HRS":
      return {
        user: {
          role: "HR",
        },
      };

    case "OTHER_ADMINS":
      return {
        user: {
          role: "ADMIN",
          id: {
            not: adminId,
          },
        },
      };
  }
}

/**
 * Get pending expenses for the Admin approval page according
 * to the selected expense scope.
 */
export async function getPendingExpensesForAdmin(
  adminId: number,
  scope: AdminExpenseScope = "EMPLOYEES",
  reimbursementStatus: "ALL" | ReimbursementStatus = "ALL",
) {
  const scopeFilter = getAdminExpenseScopeFilter(adminId, scope);

  const where: Prisma.ExpenseWhereInput = {
    status: "PENDING",

    ...scopeFilter,

    ...(reimbursementStatus !== "ALL"
      ? {
          reimbursementStatus,
        }
      : {}),
  };

  const expenses = await prisma.expense.findMany({
    where,

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

  return expenses.map(serializeExpenseAmounts);
}

/**
 * Approval history is ALWAYS restricted to the currently selected scope.
 *
 * This is intentionally server-side.
 *
 * We do NOT load everybody and filter them in React.
 */
export async function getExpenseApprovalHistory(
  adminId: number,
  scope: AdminExpenseScope = "EMPLOYEES",
  page: number = 1,
  pageSize: number = 10,
  approvalStatus: "ALL" | "PENDING" | "APPROVED" | "REJECTED" = "ALL",
  reimbursementStatus: "ALL" | ReimbursementStatus = "ALL",
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const scopeFilter = getAdminExpenseScopeFilter(adminId, scope);

  const where: Prisma.ExpenseWhereInput = {
    decidedAt: {
      not: null,
    },

    ...scopeFilter,

    ...(approvalStatus !== "ALL"
      ? {
          status: approvalStatus,
        }
      : {}),

    ...(reimbursementStatus !== "ALL"
      ? {
          reimbursementStatus,
        }
      : {}),
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
            role: true,
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
    expenses: expenses.map(serializeExpenseAmounts),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

/**
 * Deleted expense history follows exactly the same scope as
 * Pending Approvals and Approval History.
 *
 * OWN:
 *   Deleted expenses originally owned by this Admin.
 *
 * EMPLOYEES:
 *   Deleted expenses originally owned by Employees.
 *
 * HRS:
 *   Deleted expenses originally owned by HRs.
 *
 * OTHER_ADMINS:
 *   Deleted expenses originally owned by another Admin.
 */
export async function getExpenseDeletionHistoryForAdmin(
  adminId: number,
  scope: AdminExpenseScope = "EMPLOYEES",
  page: number = 1,
  pageSize: number = 10,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const ownerFilter = getAdminExpenseScopeFilter(adminId, scope);

  /*
   * getAdminExpenseScopeFilter() is based on ExpenseWhereInput,
   * while DeletedExpense has the owner through the `user` relation.
   *
   * Convert the scope into a DeletedExpense-compatible filter.
   */
  let userFilter: Prisma.UserWhereInput;

  switch (scope) {
    case "OWN":
      userFilter = {
        id: adminId,
      };
      break;

    case "EMPLOYEES":
      userFilter = {
        role: "EMPLOYEE",
      };
      break;

    case "HRS":
      userFilter = {
        role: "HR",
      };
      break;

    case "OTHER_ADMINS":
      userFilter = {
        role: "ADMIN",
        id: {
          not: adminId,
        },
      };
      break;
  }

  void ownerFilter;

  const where: Prisma.DeletedExpenseWhereInput = {
    user: userFilter,
  };

  const [deletedExpenses, total] = await prisma.$transaction([
    prisma.deletedExpense.findMany({
      where,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

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

      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.deletedExpense.count({
      where,
    }),
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
 * The caller must provide the authenticated Admin's id.
 *
 * Every Admin modification is recorded as an UPDATED audit entry.
 *
 * The `metadata.changes` object contains the exact values that changed.
 * This allows hasAdminModifiedExpense() to reliably determine whether
 * the current Admin previously modified the expense.
 */
export async function updateExpenseAsAdmin(
  id: number,
  adminId: number,
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
  changes: Record<
    string,
    {
      from: string | number | null;
      to: string | number | null;
    }
  >,
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

  return prisma.$transaction(async (tx) => {
    const updatedExpense = await tx.expense.update({
      where: {
        id,
      },
      data,
    });

    if (Object.keys(changes).length > 0) {
      await tx.expenseAuditLog.create({
        data: {
          expenseId: updatedExpense.id,
          actorId: adminId,
          action: "UPDATED",
          metadata: {
            changes,
          },
        },
      });
    }

    return updatedExpense;
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

  /*
   * Task 4B:
   *
   * The Admin who most recently modified the expense
   * cannot delete it.
   *
   * IMPORTANT:
   * We check only the latest Admin modification.
   *
   * Example:
   *
   * X modifies
   * Y modifies
   * X modifies again
   *
   * Latest modifier = X
   *
   * X -> blocked
   * Y -> allowed
   */
  const latestAdminModifierId = await getLatestAdminModifierId(id);

  if (latestAdminModifierId === adminId) {
    throw new Error(
      "You cannot delete an expense that you most recently modified. Another Admin must review it.",
    );
  }

  const ownerId = expense.userId;

  const deletedExpense = await prisma.$transaction(async (tx) => {
    const deletedExpense = await tx.deletedExpense.create({
      data: {
        originalExpenseId: expense.id,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        expenseDate: expense.expenseDate,

        ocrReceiptUrl: expense.ocrReceiptUrl,
        ocrReceiptPath: expense.ocrReceiptPath,
        ocrRawText: expense.ocrRawText,

        deletionReason: reason,
        deletedById: adminId,
        userId: ownerId,
      },
    });

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

    await tx.expense.delete({
      where: {
        id: expense.id,
      },
    });

    return deletedExpense;
  });

  await createNotification({
    userId: ownerId,
    type: "EXPENSE_DELETED",
    title: "Expense Deleted",
    message: `Your expense "${deletedExpense.title}" was deleted by an Admin.`,
    metadata: {
      deletedExpenseId: deletedExpense.id,
      originalExpenseId: deletedExpense.originalExpenseId,
      deletionReason: deletedExpense.deletionReason,
      action: "EXPENSE_DELETED",
    },
  });

  return deletedExpense;
}

/* -------------------------------------------------------------------------- */
/* Deleted Expense History                                                    */
/* -------------------------------------------------------------------------- */

export async function getDeletedExpensesForUser(userId: number) {
  const deletedExpenses = await prisma.deletedExpense.findMany({
    where: {
      userId,
    },

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

/* -------------------------------------------------------------------------- */
/* HR Reimbursement Functions                                                 */
/* -------------------------------------------------------------------------- */

export async function getApprovedExpensesForHR(
  hrId: number,
  page: number,
  pageSize: number,
  scope: ReimbursementExpenseScope = "EMPLOYEES",
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const scopeFilter = getReimbursementScopeFilter(scope, hrId);

  const where: Prisma.ExpenseWhereInput = {
    status: "APPROVED",
    reimbursementStatus: "PENDING",
    ...scopeFilter,
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
          },
        },
      },

      orderBy: [{ decidedAt: "asc" }, { createdAt: "asc" }],

      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.expense.count({
      where,
    }),
  ]);

  return {
    expenses: expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      baseCurrencyAmount:
        expense.baseCurrencyAmount !== null
          ? Number(expense.baseCurrencyAmount)
          : null,
      exchangeRate:
        expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,
    })),

    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

/* -------------------------------------------------------------------------- */
/* Reimbursement History                                                      */
/* -------------------------------------------------------------------------- */

export async function getReimbursementHistory(
  page: number = 1,
  pageSize: number = 10,
  userId?: number,
  scope?: ReimbursementExpenseScope,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const scopeFilter =
    userId !== undefined && scope
      ? getReimbursementScopeFilter(scope, userId)
      : {};

  const where: Prisma.ExpenseWhereInput = {
    reimbursementStatus: {
      in: ["REIMBURSED", "REJECTED"] satisfies ReimbursementStatus[],
    },

    reimbursementAt: {
      not: null,
    },

    ...scopeFilter,
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
        currency: expense.currency,
        baseCurrencyAmount:
          expense.baseCurrencyAmount !== null
            ? Number(expense.baseCurrencyAmount)
            : null,
        exchangeRate:
          expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,
        category: expense.category,
        status: expense.status,
        reimbursementStatus: expense.reimbursementStatus,
        reimbursementReason: expense.reimbursementReason,
        expenseDate: expense.expenseDate,
        decidedAt: expense.decidedAt,
        reimbursementAt: expense.reimbursementAt,

        ocrReceiptUrl: expense.ocrReceiptUrl,
        ocrReceiptPath: expense.ocrReceiptPath,

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

function getReimbursementScopeFilter(
  scope: ReimbursementExpenseScope,
  userId: number,
): Prisma.ExpenseWhereInput {
  switch (scope) {
    case "OWN":
      return {
        userId,
      };

    case "EMPLOYEES":
      return {
        user: {
          is: {
            role: "EMPLOYEE",
          },
        },
      };

    case "OTHER_ADMINS":
      return {
        user: {
          is: {
            role: "ADMIN",
            id: {
              not: userId,
            },
          },
        },
      };

    case "HRS":
      return {
        user: {
          is: {
            role: "HR",
          },
        },
      };

    case "OTHER_HRS":
      return {
        user: {
          is: {
            role: "HR",
            id: {
              not: userId,
            },
          },
        },
      };

    case "ADMINS":
      return {
        user: {
          is: {
            role: "ADMIN",
          },
        },
      };

    default:
      return {};
  }
}

/* Returns the ID of the Admin who most recently modified the expense.*/
export async function getLatestAdminModifierId(
  expenseId: number,
): Promise<number | null> {
  const latestModification = await prisma.expenseAuditLog.findFirst({
    where: {
      expenseId,
      action: "UPDATED",

      actor: {
        role: "ADMIN",
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      actorId: true,
    },
  });

  return latestModification?.actorId ?? null;
}
