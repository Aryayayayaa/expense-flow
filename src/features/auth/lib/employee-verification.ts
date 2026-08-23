import { prisma } from "@/lib/prisma";
import { getRequestDeadline } from "./request-deadlines";

export async function createEmployeeVerificationRequest(data: {
  userId: number;
  proofUrl?: string;
  proofPath?: string;
}) {
  return prisma.employeeVerificationRequest.create({
    data: {
      ...data,
      deadlineAt: getRequestDeadline(),
    },
  });
}

export async function getPendingEmployeeVerificationRequests() {
  return prisma.employeeVerificationRequest.findMany({
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

export async function getEmployeeVerificationRequestsForUser(userId: number) {
  return prisma.employeeVerificationRequest.findMany({
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

export async function getLatestEmployeeVerificationRequest(userId: number) {
  return prisma.employeeVerificationRequest.findFirst({
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

export async function getEmployeeVerificationHistory() {
  return prisma.employeeVerificationRequest.findMany({
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
