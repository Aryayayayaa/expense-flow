import { prisma } from "@/lib/prisma";

export async function getExpenses() {
  return prisma.expense.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getExpense(id: number) {
  return prisma.expense.findUnique({
    where: {
      id,
    },
  });
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category: string;
}) {
  return prisma.expense.create({
    data,
  });
}

export async function updateExpense(
  id: number,
  data: Partial<{
    title: string;
    amount: number;
    category: string;
  }>,
) {
  return prisma.expense.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteExpense(id: number) {
  return prisma.expense.delete({
    where: {
      id,
    },
  });
}
