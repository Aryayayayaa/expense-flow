import { prisma } from "@/lib/prisma";

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
    },

    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
  });

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));
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
  return prisma.expense.findMany({
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
}

export async function getExpenseApprovalHistory(
  page: number = 1,
  pageSize: number = 10,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const where = {
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

//Get approved expenses that are waiting for HR reimbursement.

export async function getApprovedExpensesForHR(hrId: number) {
  const expenses = await prisma.expense.findMany({
    where: {
      status: "APPROVED",
      userId: { not: hrId },
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

//Get expenses that have already been reimbursed: read-only history

export async function getReimbursementHistory(
  page: number = 1,
  pageSize: number = 10,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const where = {
    reimbursementStatus: "REIMBURSED" as const,
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
    expenses: expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    })),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}
