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
