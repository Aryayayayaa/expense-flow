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

export async function getAllRoleRequests() {
  return prisma.roleVerificationRequest.findMany({
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
  });
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
