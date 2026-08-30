import { prisma } from "@/lib/prisma";

export async function getEmployeeContactRequests(userId: number) {
  return prisma.contactRequest.findMany({
    where: {
      userId,
      status: {
        not: "RESOLVED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getEmployeeContactRequestHistory(userId: number) {
  return prisma.contactRequest.findMany({
    where: {
      userId,
      status: "RESOLVED",
    },
    orderBy: {
      resolvedAt: "desc",
    },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      actionTaken: true,
      resolvedByUser: {
        select: {
          name: true,
          email: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getAllContactRequests() {
  return prisma.contactRequest.findMany({
    where: {
      status: {
        not: "RESOLVED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      actionTaken: true,
      resolvedByUser: {
        select: {
          name: true,
          email: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getAllContactRequestHistory() {
  return prisma.contactRequest.findMany({
    where: {
      status: "RESOLVED",
    },
    orderBy: {
      resolvedAt: "desc",
    },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      actionTaken: true,

      resolvedByUser: {
        select: {
          name: true,
          email: true,
        },
      },

      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}
