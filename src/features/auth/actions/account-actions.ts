"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { activateUser, deactivateUser } from "../lib/users";

import { createNotification } from "@/features/notifications/lib/notifications";

export async function deactivateAccountAction(userId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const actorId = Number(session.user.id);

    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return {
        success: false,
        message: "Only Admins and HR can deactivate accounts.",
      };
    }

    if (actorId === userId) {
      return {
        success: false,
        message: "You cannot deactivate your own account.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: "This account is already deactivated.",
      };
    }

    /*
     * HR should manage employee accounts.
     * Admin can manage employee/HR accounts but cannot deactivate another Admin.
     */
    if (user.role === "ADMIN") {
      return {
        success: false,
        message: "Admin accounts cannot be deactivated.",
      };
    }

    const actor = await prisma.user.findUnique({
      where: {
        id: actorId,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    if (!actor) {
      return {
        success: false,
        message: "Acting user not found.",
      };
    }

    const deactivatedUser = await deactivateUser(userId);

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
      reviewers
        .filter((reviewer) => reviewer.id !== userId)
        .map((reviewer) =>
          createNotification({
            userId: reviewer.id,
            type: "EMPLOYEE_ACCOUNT_DEACTIVATED",
            title: "Employee Account Deactivated",
            message: `${deactivatedUser.name}'s account was deactivated by ${actor.name} (${actor.role}).`,
            metadata: {
              employeeId: deactivatedUser.id,
              employeeName: deactivatedUser.name,
              employeeEmail: deactivatedUser.email,
              previousRole: deactivatedUser.role,
              action: "DEACTIVATED",
              performedById: actorId,
              performedByName: actor.name,
              performedByRole: actor.role,
            },
          }),
        ),
    );

    revalidatePath("/admin");
    revalidatePath("/hr");

    return {
      success: true,
      message: "Account deactivated successfully.",
    };
  } catch (error) {
    console.error("Deactivate Account Error:", error);

    return {
      success: false,
      message: "Unable to deactivate account.",
    };
  }
}

export async function activateAccountAction(userId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const actorId = Number(session.user.id);

    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return {
        success: false,
        message: "Only Admins and HR can activate accounts.",
      };
    }

    if (actorId === userId) {
      return {
        success: false,
        message: "Your account is already active.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (user.isActive) {
      return {
        success: false,
        message: "This account is already active.",
      };
    }

    if (user.role === "ADMIN") {
      return {
        success: false,
        message: "Admin accounts cannot be reactivated from this workflow.",
      };
    }

    const actor = await prisma.user.findUnique({
      where: {
        id: actorId,
      },
      select: {
        name: true,
        role: true,
      },
    });

    if (!actor) {
      return {
        success: false,
        message: "Acting user not found.",
      };
    }

    const activatedUser = await activateUser(userId);

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
      reviewers
        .filter((reviewer) => reviewer.id !== userId)
        .map((reviewer) =>
          createNotification({
            userId: reviewer.id,
            type: "EMPLOYEE_ACCOUNT_ACTIVATED",
            title: "Employee Account Reactivated",
            message: `${activatedUser.name}'s account was reactivated by ${actor.name} (${actor.role}).`,
            metadata: {
              employeeId: activatedUser.id,
              employeeName: activatedUser.name,
              employeeEmail: activatedUser.email,
              role: activatedUser.role,
              action: "ACTIVATED",
              performedById: actorId,
              performedByName: actor.name,
              performedByRole: actor.role,
            },
          }),
        ),
    );

    revalidatePath("/admin");
    revalidatePath("/hr");

    return {
      success: true,
      message: "Account reactivated successfully.",
    };
  } catch (error) {
    console.error("Activate Account Error:", error);

    return {
      success: false,
      message: "Unable to reactivate account.",
    };
  }
}
