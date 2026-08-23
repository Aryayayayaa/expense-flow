import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import {
  isRequestExpired,
  shouldSendRequestReminder,
} from "./request-deadlines";

import { createNotification } from "@/features/notifications/lib/notifications";

const AUTO_REJECTION_REASON =
  "Request automatically rejected because the review deadline expired.";

export async function processRequestDeadlines() {
  const now = new Date();

  let remindersSent = 0;
  let requestsAutoRejected = 0;

  /*
   * ------------------------------------------------------------------------
   * Name Change Requests
   * ------------------------------------------------------------------------
   */

  const nameChangeRequests = await prisma.nameChangeRequest.findMany({
    where: {
      status: "PENDING",
      deadlineAt: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  for (const request of nameChangeRequests) {
    if (!request.deadlineAt) {
      continue;
    }

    if (isRequestExpired(request.deadlineAt, now)) {
      await prisma.nameChangeRequest.update({
        where: {
          id: request.id,
        },
        data: {
          status: "REJECTED",
          rejectionReason: AUTO_REJECTION_REASON,
          reviewedAt: now,
          reviewedById: null,
        },
      });

      await createNotification({
        userId: request.userId,
        type: "EMPLOYEE_ACCOUNT_UPDATED",
        title: "Name Change Request Auto-Rejected",
        message:
          "Your name change request was automatically rejected because the review deadline expired.",
        metadata: {
          requestId: request.id,
          action: "NAME_CHANGE_AUTO_REJECTED",
          reason: AUTO_REJECTION_REASON,
        },
      });

      requestsAutoRejected++;
      continue;
    }

    if (
      shouldSendRequestReminder(request.deadlineAt, request.reminderSentAt, now)
    ) {
      await prisma.nameChangeRequest.update({
        where: {
          id: request.id,
        },
        data: {
          reminderSentAt: now,
        },
      });

      await notifyReviewers(
        "Name Change Request Reminder",
        `${request.user.name} has a pending name change request approaching its review deadline.`,
        {
          requestId: request.id,
          employeeId: request.userId,
          action: "NAME_CHANGE_REMINDER",
        },
      );

      remindersSent++;
    }
  }

  /*
   * ------------------------------------------------------------------------
   * Identity Verification Requests
   * ------------------------------------------------------------------------
   */

  const identityRequests = await prisma.employeeVerificationRequest.findMany({
    where: {
      status: "PENDING",
      deadlineAt: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  for (const request of identityRequests) {
    if (!request.deadlineAt) {
      continue;
    }

    if (isRequestExpired(request.deadlineAt, now)) {
      await prisma.employeeVerificationRequest.update({
        where: {
          id: request.id,
        },
        data: {
          status: "REJECTED",
          rejectionReason: AUTO_REJECTION_REASON,
          reviewedAt: now,
          reviewedById: null,
        },
      });

      await createNotification({
        userId: request.userId,
        type: "EMPLOYEE_VERIFICATION_REJECTED",
        title: "Identity Verification Auto-Rejected",
        message:
          "Your identity verification request was automatically rejected because the review deadline expired.",
        metadata: {
          requestId: request.id,
          action: "IDENTITY_VERIFICATION_AUTO_REJECTED",
          reason: AUTO_REJECTION_REASON,
        },
      });

      requestsAutoRejected++;
      continue;
    }

    if (
      shouldSendRequestReminder(request.deadlineAt, request.reminderSentAt, now)
    ) {
      await prisma.employeeVerificationRequest.update({
        where: {
          id: request.id,
        },
        data: {
          reminderSentAt: now,
        },
      });

      await notifyReviewers(
        "Identity Verification Reminder",
        `${request.user.name} has a pending identity verification request approaching its review deadline.`,
        {
          requestId: request.id,
          employeeId: request.userId,
          action: "IDENTITY_VERIFICATION_REMINDER",
        },
      );

      remindersSent++;
    }
  }

  /*
   * ------------------------------------------------------------------------
   * Role Verification Requests
   * ------------------------------------------------------------------------
   */

  const roleRequests = await prisma.roleVerificationRequest.findMany({
    where: {
      status: "PENDING",
      deadlineAt: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  for (const request of roleRequests) {
    if (!request.deadlineAt) {
      continue;
    }

    if (isRequestExpired(request.deadlineAt, now)) {
      await prisma.roleVerificationRequest.update({
        where: {
          id: request.id,
        },
        data: {
          status: "REJECTED",
          rejectionReason: AUTO_REJECTION_REASON,
          reviewedAt: now,
          reviewedById: null,
        },
      });

      await createNotification({
        userId: request.userId,
        type: "ROLE_VERIFICATION_REJECTED",
        title: "Role Verification Auto-Rejected",
        message:
          "Your role verification request was automatically rejected because the review deadline expired.",
        metadata: {
          requestId: request.id,
          requestedRole: request.requestedRole,
          action: "ROLE_VERIFICATION_AUTO_REJECTED",
          reason: AUTO_REJECTION_REASON,
        },
      });

      requestsAutoRejected++;
      continue;
    }

    if (
      shouldSendRequestReminder(request.deadlineAt, request.reminderSentAt, now)
    ) {
      await prisma.roleVerificationRequest.update({
        where: {
          id: request.id,
        },
        data: {
          reminderSentAt: now,
        },
      });

      await notifyReviewers(
        "Role Verification Reminder",
        `${request.user.name} has a pending ${request.requestedRole} role verification request approaching its review deadline.`,
        {
          requestId: request.id,
          employeeId: request.userId,
          requestedRole: request.requestedRole,
          action: "ROLE_VERIFICATION_REMINDER",
        },
      );

      remindersSent++;
    }
  }

  return {
    remindersSent,
    requestsAutoRejected,
  };
}

async function notifyReviewers(
  title: string,
  message: string,
  metadata: Prisma.InputJsonValue,
) {
  const reviewers = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "HR"],
      },
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  await Promise.all(
    reviewers.map((reviewer) =>
      createNotification({
        userId: reviewer.id,
        type: "SYSTEM",
        title,
        message,
        metadata,
      }),
    ),
  );
}
