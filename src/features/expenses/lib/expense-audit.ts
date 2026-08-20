import { prisma } from "@/lib/prisma";

import type { ExpenseAuditAction, Prisma } from "@prisma/client";

type CreateExpenseAuditLogInput = {
  expenseId?: number;
  actorId: number;
  action: ExpenseAuditAction;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createExpenseAuditLog({
  expenseId,
  actorId,
  action,
  reason,
  metadata,
}: CreateExpenseAuditLogInput) {
  const actionStart = performance.now();

  const sessionStart = performance.now();

  console.log(
    `[Expense Performance] audit log: ${(performance.now() - sessionStart).toFixed(2)}ms`,
  );
  return prisma.expenseAuditLog.create({
    data: {
      expenseId,
      actorId,
      action,
      reason,
      metadata,
    },
  });
}
