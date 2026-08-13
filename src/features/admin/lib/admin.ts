import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  const [totalUsers, pendingExpenses, users] = await Promise.all([
    prisma.user.count(),

    prisma.expense.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    totalUsers,
    pendingExpenses,
    users,
  };
}
