import { prisma } from "./prisma";

export async function getExpenses() {
  return prisma.expense.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}
