import { NotificationType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

type CreateNotificationInput = {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  expenseId?: number;
  metadata?: Prisma.InputJsonValue;
};

async function sendNotificationEmail(
  userId: number,
  title: string,
  message: string,
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return;
    }

    await sendBrevoEmail({
      to: {
        email: user.email,
        name: user.name,
      },
      subject: `ExpenseFlow - ${title}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
          <h2 style="color: #1e293b;">Expense<span style="color: #2563eb;">Flow</span></h2>

          <h3 style="color: #1e293b;">${title}</h3>

          <p style="line-height: 1.6;">
            ${message}
          </p>

          <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
            This notification is also available in your ExpenseFlow Notification Bell.
          </p>
        </div>
      `,
      textContent: `ExpenseFlow - ${title}\n\n${message}`,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  expenseId,
  metadata,
}: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        expenseId,
        metadata,
      },
    });

    await sendNotificationEmail(userId, title, message);

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);

    return null;
  }
}

export async function createNotifications(
  notifications: CreateNotificationInput[],
) {
  if (notifications.length === 0) {
    return {
      count: 0,
    };
  }

  try {
    const result = await prisma.notification.createMany({
      data: notifications.map((notification) => ({
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        expenseId: notification.expenseId,
        metadata: notification.metadata,
      })),
    });

    await Promise.all(
      notifications.map((notification) =>
        sendNotificationEmail(
          notification.userId,
          notification.title,
          notification.message,
        ),
      ),
    );

    return result;
  } catch (error) {
    console.error("Failed to create notifications:", error);

    return {
      count: 0,
    };
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
