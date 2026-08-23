import { prisma } from "@/lib/prisma";

export async function createNameChangeRequest(data: {
  userId: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl?: string;
  proofPath?: string;
}) {
  return prisma.nameChangeRequest.create({
    data,
  });
}

export async function getPendingNameChangeRequests() {
  return prisma.nameChangeRequest.findMany({
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
      createdAt: "asc",
    },
  });
}

export async function getNameChangeRequestHistory() {
  return prisma.nameChangeRequest.findMany({
    where: {
      status: {
        in: ["APPROVED", "REJECTED"],
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
      reviewedAt: "desc",
    },
  });
}

export async function getNameChangeRequestsForUser(userId: number) {
  return prisma.nameChangeRequest.findMany({
    where: {
      userId,
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
