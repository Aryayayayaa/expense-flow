import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { AnalyticsExpense } from "../types";

export type AnalyticsScope = "OWN" | "ALL" | "EMPLOYEES";

async function getExpensesForAnalytics(scope: AnalyticsScope, userId: number) {
  if (scope === "OWN") {
    return prisma.expense.findMany({
      where: {
        userId,
      },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  if (scope === "EMPLOYEES") {
    return prisma.expense.findMany({
      where: {
        user: {
          role: "EMPLOYEE",
        },
      },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  return prisma.expense.findMany({
    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAnalyticsData(
  scope: AnalyticsScope = "OWN",
): Promise<AnalyticsExpense[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);
  const role = session.user.role;

  if (scope !== "OWN" && role !== "ADMIN" && role !== "HR") {
    throw new Error("Forbidden");
  }

  const expenses = await getExpensesForAnalytics(scope, userId);

  return expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    amount: Number(expense.amount),
    category: expense.category,
    expenseDate: expense.expenseDate,
    billProofUrl: expense.billProofUrl,
    billProofPath: expense.billProofPath,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    userId: expense.userId,
  }));
}
