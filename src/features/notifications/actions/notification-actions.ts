"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/lib/notifications";

async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return Number(session.user.id);
}

export async function markNotificationAsReadAction(notificationId: number) {
  const userId = await requireUser();

  if (!userId) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  try {
    await markNotificationAsRead(notificationId, userId);

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notification marked as read.",
    };
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return {
      success: false,
      message: "Unable to update notification.",
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  const userId = await requireUser();

  if (!userId) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  try {
    await markAllNotificationsAsRead(userId);

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "All notifications marked as read.",
    };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return {
      success: false,
      message: "Unable to update notifications.",
    };
  }
}
