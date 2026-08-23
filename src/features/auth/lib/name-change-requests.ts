import { prisma } from "@/lib/prisma";

import { getRequestDeadline } from "./request-deadlines";

export async function createNameChangeRequest(data: {
  userId: number;
  currentName: string;
  requestedName: string;
  reason: string;
  proofUrl?: string;
  proofPath?: string;
}) {
  return prisma.nameChangeRequest.create({
    data: {
      ...data,
      deadlineAt: getRequestDeadline(),
    },
  });
}

export async function getPendingNameChangeRequests(excludedUserId?: number) {
  return prisma.nameChangeRequest.findMany({
    where: {
      status: "PENDING",

      ...(excludedUserId !== undefined
        ? {
            userId: {
              not: excludedUserId,
            },
          }
        : {}),
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

export async function getNameChangeRequestHistory(excludedUserId?: number) {
  return prisma.nameChangeRequest.findMany({
    where: {
      status: {
        in: ["APPROVED", "REJECTED"],
      },

      ...(excludedUserId !== undefined
        ? {
            userId: {
              not: excludedUserId,
            },
          }
        : {}),
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

export async function getLatestApprovedNameChangeRequest(userId: number) {
  return prisma.nameChangeRequest.findFirst({
    where: {
      userId,
      status: "APPROVED",
      reviewedAt: {
        not: null,
      },
    },

    orderBy: {
      reviewedAt: "desc",
    },

    select: {
      reviewedAt: true,
    },
  });
}
