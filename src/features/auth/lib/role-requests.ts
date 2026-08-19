import { prisma } from "@/lib/prisma";

export async function createRoleVerificationRequest(data: {
  userId: number;
  requestedRole: "ADMIN" | "HR";
  proofUrl?: string;
  proofPath?: string;
}) {
  return prisma.roleVerificationRequest.create({
    data,
  });
}

export async function getPendingRoleRequests() {
  return prisma.roleVerificationRequest.findMany({
    where: {
      status: "PENDING",
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
  });
}

export async function getAllRoleRequests(
  page: number = 1,
  pageSize: number = 10,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const [requests, total] = await prisma.$transaction([
    prisma.roleVerificationRequest.findMany({
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
        createdAt: "desc",
      },

      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.roleVerificationRequest.count(),
  ]);

  return {
    requests,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

export async function getRoleRequestsForUser(userId: number) {
  return prisma.roleVerificationRequest.findMany({
    where: {
      userId,
    },
    include: {
      reviewedBy: {
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
  });
}
