import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  const [
    totalUsers,
    pendingRoleRequests,
    pendingExpenses,
    users,
    roleRequests,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.roleVerificationRequest.count({
      where: {
        status: "PENDING",
      },
    }),

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

    prisma.roleVerificationRequest.findMany({
      where: {
        status: "PENDING",
        requestedRole: {
          in: ["ADMIN", "HR"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  return {
    totalUsers,
    pendingRoleRequests,
    pendingExpenses,
    users,
    roleRequests,
  };
}
