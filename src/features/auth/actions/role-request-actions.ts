"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRoleVerificationRequest } from "../lib/role-requests";
import { createNotification } from "@/features/notifications/lib/notifications";
import {
  canReviewOwnRoleRequest,
  canReviewRoleRequest,
} from "../lib/role-permissions";

export async function createRoleRequestAction(
  requestedRole: "ADMIN" | "HR",
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

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (user.role !== "EMPLOYEE") {
      return {
        success: false,
        message: "Only employees can request role verification.",
      };
    }

    if (requestedRole !== "ADMIN" && requestedRole !== "HR") {
      return {
        success: false,
        message: "Invalid role requested.",
      };
    }

    if (!proofUrl || !proofPath) {
      return {
        success: false,
        message: "Verification proof is required.",
      };
    }

    const existingRequest = await prisma.roleVerificationRequest.findFirst({
      where: {
        userId,
        requestedRole,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message: "You already have a pending request for this role.",
      };
    }

    const request = await createRoleVerificationRequest({
      userId,
      requestedRole,
      proofUrl,
      proofPath,
    });

    const reviewers = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "HR"],
        },
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      reviewers.map((reviewer) =>
        createNotification({
          userId: reviewer.id,
          type: "ROLE_VERIFICATION_PENDING",
          title: "Role Verification Request",
          message: `${session.user.name ?? "An employee"} has requested verification for the ${requestedRole} role.`,
          metadata: {
            requestId: request.id,
            requestedRole,
            employeeId: userId,
          },
        }),
      ),
    );

    revalidatePath("/profile");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Role verification request submitted successfully.",
      requestId: request.id,
    };
  } catch (error) {
    console.error("Create Role Request Error:", error);

    return {
      success: false,
      message: "Unable to submit role verification request.",
    };
  }
}

export async function approveRoleRequestAction(requestId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const reviewerId = Number(session.user.id);

    const request = await prisma.roleVerificationRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Role verification request not found.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been reviewed.",
      };
    }

    if (!canReviewRoleRequest(session.user.role, request.requestedRole)) {
      return {
        success: false,
        message: "You are not authorized to review this request.",
      };
    }

    if (!canReviewOwnRoleRequest(reviewerId, request.user.id)) {
      return {
        success: false,
        message: "You cannot approve your own role request.",
      };
    }

    await prisma.$transaction([
      prisma.roleVerificationRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: reviewerId,
        },
      }),

      prisma.user.update({
        where: {
          id: request.user.id,
        },
        data: {
          role: request.requestedRole,
        },
      }),
    ]);

    await createNotification({
      userId: request.user.id,
      type: "ROLE_VERIFICATION_APPROVED",
      title: "Role Request Approved",
      message: `Your request for the ${request.requestedRole} role has been approved.`,
      metadata: {
        requestId: request.id,
        previousRole: request.user.role,
        newRole: request.requestedRole,
      },
    });

    if (request.user.role !== request.requestedRole) {
      await createNotification({
        userId: request.user.id,
        type: "ROLE_UPGRADED",
        title: "Role Updated",
        message: `Your account role has been upgraded from ${request.user.role} to ${request.requestedRole}.`,
        metadata: {
          requestId: request.id,
          previousRole: request.user.role,
          newRole: request.requestedRole,
        },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Role request approved successfully.",
    };
  } catch (error) {
    console.error("Approve Role Request Error:", error);

    return {
      success: false,
      message: "Unable to approve role request.",
    };
  }
}

export async function rejectRoleRequestAction(
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

    const reviewerId = Number(session.user.id);

    const reason = rejectionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "A rejection reason is required.",
      };
    }

    const request = await prisma.roleVerificationRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Role verification request not found.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been reviewed.",
      };
    }

    if (!canReviewRoleRequest(session.user.role, request.requestedRole)) {
      return {
        success: false,
        message: "You are not authorized to review this request.",
      };
    }

    if (!canReviewOwnRoleRequest(reviewerId, request.user.id)) {
      return {
        success: false,
        message: "You cannot reject your own role request.",
      };
    }

    await prisma.roleVerificationRequest.update({
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
      userId: request.user.id,
      type: "ROLE_VERIFICATION_REJECTED",
      title: "Role Request Rejected",
      message: `Your request for the ${request.requestedRole} role has been rejected.`,
      metadata: {
        requestId: request.id,
        requestedRole: request.requestedRole,
        rejectionReason: reason,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Role request rejected successfully.",
    };
  } catch (error) {
    console.error("Reject Role Request Error:", error);

    return {
      success: false,
      message: "Unable to reject role request.",
    };
  }
}
