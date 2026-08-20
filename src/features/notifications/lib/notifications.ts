import { NotificationType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  expenseId?: number;
  metadata?: Prisma.InputJsonValue;
};

type CreateNotificationsInput = {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  expenseId?: number;
  metadata?: Prisma.InputJsonValue;
};

export async function createNotification({
  userId,
  type,
  title,
  message,
  expenseId,
  metadata,
}: CreateNotificationInput) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        expenseId,
        metadata,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);

    return null;
  }
}

export async function createNotifications(
  notifications: CreateNotificationsInput[],
) {
  if (notifications.length === 0) {
    return {
      count: 0,
    };
  }

  try {
    return await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error("Failed to create notifications:", error);

    throw error;
  }
}

export async function getNotifications(userId: number, limit = 20) {
  return prisma.notification.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: number) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(
  notificationId: number,
  userId: number,
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
    },
  });
}

export async function markAllNotificationsAsRead(userId: number) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
    },
  });
}
