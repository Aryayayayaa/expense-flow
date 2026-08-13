import { prisma } from "@/lib/prisma";

export async function getExpenses(userId: number) {
  return prisma.expense.findMany({
    where: {
      userId,
    },
    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
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

  return prisma.expense.delete({
    where: {
      id,
    },
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

/**
 * Get expenses that are currently waiting for admin approval.
 */
export async function getPendingExpensesForAdmin() {
  return prisma.expense.findMany({
    where: {
      status: "PENDING",
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
    orderBy: [{ expenseDate: "asc" }, { createdAt: "asc" }],
  });
}
