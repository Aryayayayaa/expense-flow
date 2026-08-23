"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { activateUser, deactivateUser } from "../lib/users";
import { createNameChangeRequest } from "../lib/name-change-requests";

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

export async function requestNameChangeAction(
  requestedName: string,
  reason: string,
  proofUrl?: string,
  proofPath?: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const userId = Number(session.user.id);

    const name = requestedName.trim();
    const trimmedReason = reason.trim();

    if (!name) {
      return {
        success: false,
        message: "Name is required.",
      };
    }

    if (name.length < 2) {
      return {
        success: false,
        message: "Name must be at least 2 characters long.",
      };
    }

    if (!trimmedReason) {
      return {
        success: false,
        message: "A reason is required for a name change request.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
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
        message: "Your account is deactivated.",
      };
    }

    if (user.name.trim() === name) {
      return {
        success: false,
        message: "The requested name is the same as your current name.",
      };
    }

    const existingRequest = await prisma.nameChangeRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message: "You already have a pending name change request.",
      };
    }

    const request = await createNameChangeRequest({
      userId,
      currentName: user.name,
      requestedName: name,
      reason: trimmedReason,
      proofUrl,
      proofPath,
    });

    /*
     * Both HR and Admin can review name change requests.
     * Therefore both roles must be notified when a request is submitted.
     */
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
          type: "EMPLOYEE_ACCOUNT_UPDATED",
          title: "Name Change Request",
          message: `${user.name} has requested to change their name to ${name}.`,
          metadata: {
            requestId: request.id,
            employeeId: user.id,
            currentName: user.name,
            requestedName: name,
            reason: trimmedReason,
            hasProof: Boolean(proofUrl || proofPath),
            action: "NAME_CHANGE_REQUESTED",
          },
        }),
      ),
    );

    revalidatePath("/profile");
    revalidatePath("/admin");
    revalidatePath("/hr");

    return {
      success: true,
      message: "Name change request submitted successfully.",
      requestId: request.id,
    };
  } catch (error) {
    console.error("Request Name Change Error:", error);

    return {
      success: false,
      message: "Unable to submit name change request.",
    };
  }
}

export async function approveNameChangeRequestAction(requestId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    /*
     * Both HR and Admin are allowed to review name change requests.
     */
    if (session.user.role !== "HR" && session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Only HR or Admin can approve name change requests.",
      };
    }

    const reviewerId = Number(session.user.id);

    const request = await prisma.nameChangeRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Name change request not found.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been reviewed.",
      };
    }

    if (request.userId === reviewerId) {
      return {
        success: false,
        message: "You cannot approve your own name change request.",
      };
    }

    if (!request.user.isActive) {
      return {
        success: false,
        message: "The requesting user's account is deactivated.",
      };
    }

    await prisma.$transaction([
      prisma.nameChangeRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          rejectionReason: null,
        },
      }),

      prisma.user.update({
        where: {
          id: request.userId,
        },
        data: {
          name: request.requestedName,
        },
      }),
    ]);

    await createNotification({
      userId: request.userId,
      type: "EMPLOYEE_ACCOUNT_UPDATED",
      title: "Name Change Approved",
      message: `Your name change request has been approved. Your name is now ${request.requestedName}.`,
      metadata: {
        requestId: request.id,
        previousName: request.currentName,
        newName: request.requestedName,
        reviewedById: reviewerId,
        action: "NAME_CHANGE_APPROVED",
      },
    });

    revalidatePath("/profile");
    revalidatePath("/hr");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Name change request approved successfully.",
    };
  } catch (error) {
    console.error("Approve Name Change Request Error:", error);

    return {
      success: false,
      message: "Unable to approve name change request.",
    };
  }
}

export async function rejectNameChangeRequestAction(
  requestId: number,
  rejectionReason: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    /*
     * Both HR and Admin are allowed to review name change requests.
     */
    if (session.user.role !== "HR" && session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Only HR or Admin can reject name change requests.",
      };
    }

    const reviewerId = Number(session.user.id);
    const reason = rejectionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "A rejection reason is required.",
      };
    }

    const request = await prisma.nameChangeRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Name change request not found.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been reviewed.",
      };
    }

    if (request.userId === reviewerId) {
      return {
        success: false,
        message: "You cannot reject your own name change request.",
      };
    }

    await prisma.nameChangeRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });

    await createNotification({
      userId: request.userId,
      type: "EMPLOYEE_ACCOUNT_UPDATED",
      title: "Name Change Rejected",
      message: `Your name change request was rejected.`,
      metadata: {
        requestId: request.id,
        requestedName: request.requestedName,
        rejectionReason: reason,
        reviewedById: reviewerId,
        action: "NAME_CHANGE_REJECTED",
      },
    });

    revalidatePath("/profile");
    revalidatePath("/hr");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Name change request rejected successfully.",
    };
  } catch (error) {
    console.error("Reject Name Change Request Error:", error);

    return {
      success: false,
      message: "Unable to reject name change request.",
    };
  }
}

export async function updateOwnEmailAction(email: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return {
        success: false,
        message: "Email is required.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    const userId = Number(session.user.id);

    if (existingUser && existingUser.id !== userId) {
      return {
        success: false,
        message: "That email address is already in use.",
      };
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email: normalizedEmail,
      },
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: "Email updated successfully.",
    };
  } catch (error) {
    console.error("Update Own Email Error:", error);

    return {
      success: false,
      message: "Unable to update email.",
    };
  }
}

export async function updateOwnPasswordAction(password: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: Number(session.user.id),
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Password updated successfully.",
    };
  } catch (error) {
    console.error("Update Own Password Error:", error);

    return {
      success: false,
      message: "Unable to update password.",
    };
  }
}

export async function updateOwnImageAction(image: string | null) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    await prisma.user.update({
      where: {
        id: Number(session.user.id),
      },
      data: {
        image,
      },
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile photo updated successfully.",
    };
  } catch (error) {
    console.error("Update Own Image Error:", error);

    return {
      success: false,
      message: "Unable to update profile photo.",
    };
  }
}
