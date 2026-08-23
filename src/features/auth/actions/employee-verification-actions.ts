"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createEmployeeVerificationRequest } from "../lib/employee-verification";
import { createNotification } from "@/features/notifications/lib/notifications";

const MAX_VERIFICATION_ATTEMPTS = 5;

export async function createEmployeeVerificationAction(
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

    if (
      session.user.role !== "EMPLOYEE" &&
      session.user.role !== "HR" &&
      session.user.role !== "ADMIN"
    ) {
      return {
        success: false,
        message: "You are not authorized to submit identity verification.",
      };
    }

    const userId = Number(session.user.id);

    if (!proofUrl && !proofPath) {
      return {
        success: false,
        message: "Verification proof is required.",
      };
    }

    /*
     * Once identity verification has been approved, no further
     * verification request is required.
     */
    const approvedRequest = await prisma.employeeVerificationRequest.findFirst({
      where: {
        userId,
        status: "APPROVED",
      },
      select: {
        id: true,
      },
    });

    if (approvedRequest) {
      return {
        success: false,
        message: "Your identity has already been verified.",
      };
    }

    /*
     * Only one request can be pending at a time.
     */
    const pendingRequest = await prisma.employeeVerificationRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
      select: {
        id: true,
      },
    });

    if (pendingRequest) {
      return {
        success: false,
        message: "You already have a pending verification request.",
      };
    }

    /*
     * A user gets a maximum of 5 verification attempts.
     *
     * Rejected requests count as attempts.
     * Approved requests are handled above and permanently complete
     * the verification workflow.
     */
    const attemptCount = await prisma.employeeVerificationRequest.count({
      where: {
        userId,
      },
    });

    if (attemptCount >= MAX_VERIFICATION_ATTEMPTS) {
      return {
        success: false,
        message:
          "You have reached the maximum of 5 identity verification attempts.",
      };
    }

    const request = await createEmployeeVerificationRequest({
      userId,
      proofUrl,
      proofPath,
    });

    /*
     * HR and Admin can review identity verification requests.
     * The submitter is excluded from reviewer notifications.
     */
    const reviewers = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "HR"],
        },
        isActive: true,
        id: {
          not: userId,
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
          type: "EMPLOYEE_VERIFICATION_PENDING",
          title: "Employee Verification Request",
          message: `${session.user.name ?? "A user"} has submitted an identity verification request.`,
          metadata: {
            requestId: request.id,
            employeeId: userId,
            submittedByRole: session.user.role,
          },
        }),
      ),
    );

    revalidatePath("/requests");
    revalidatePath("/hr");
    revalidatePath("/admin");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Identity verification request submitted successfully.",
      requestId: request.id,
    };
  } catch (error) {
    console.error("Create employee verification error:", error);

    return {
      success: false,
      message: "Unable to submit identity verification request.",
    };
  }
}

/*
 * HR and Admin are allowed to review employee identity verification
 * requests, but cannot review their own request.
 */
async function requireHrOrAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      message: "Unauthorized.",
    };
  }

  if (session.user.role !== "HR" && session.user.role !== "ADMIN") {
    return {
      success: false as const,
      message: "You are not authorized to perform this action.",
    };
  }

  return {
    success: true as const,
    reviewerId: Number(session.user.id),
    reviewerRole: session.user.role,
  };
}

export async function approveEmployeeVerificationAction(requestId: number) {
  try {
    const reviewer = await requireHrOrAdmin();

    if (!reviewer.success) {
      return reviewer;
    }

    const request = await prisma.employeeVerificationRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        status: true,
        userId: true,

        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Verification request not found.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been reviewed.",
      };
    }

    if (request.userId === reviewer.reviewerId) {
      return {
        success: false,
        message: "You cannot review your own verification request.",
      };
    }

    await prisma.employeeVerificationRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: reviewer.reviewerId,
        rejectionReason: null,
      },
    });

    await createNotification({
      userId: request.userId,
      type: "EMPLOYEE_VERIFICATION_APPROVED",
      title: "Identity Verification Approved",
      message: `Your employee identity verification has been approved by ${reviewer.reviewerRole}.`,
      metadata: {
        requestId: request.id,
        reviewedById: reviewer.reviewerId,
        reviewedByRole: reviewer.reviewerRole,
      },
    });

    revalidatePath("/requests");
    revalidatePath("/hr");
    revalidatePath("/admin");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Employee verification approved successfully.",
    };
  } catch (error) {
    console.error("Approve employee verification error:", error);

    return {
      success: false,
      message: "Unable to approve employee verification.",
    };
  }
}

export async function rejectEmployeeVerificationAction(
  requestId: number,
  rejectionReason: string,
) {
  try {
    const reviewer = await requireHrOrAdmin();

    if (!reviewer.success) {
      return reviewer;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      return {
        success: false,
        message: "A rejection reason is required.",
      };
    }

    const request = await prisma.employeeVerificationRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Verification request not found.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been reviewed.",
      };
    }

    if (request.userId === reviewer.reviewerId) {
      return {
        success: false,
        message: "You cannot review your own verification request.",
      };
    }

    await prisma.employeeVerificationRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedById: reviewer.reviewerId,
      },
    });

    await createNotification({
      userId: request.userId,
      type: "EMPLOYEE_VERIFICATION_REJECTED",
      title: "Identity Verification Rejected",
      message: `Your employee identity verification has been rejected by ${reviewer.reviewerRole}.`,
      metadata: {
        requestId: request.id,
        rejectionReason: reason,
        reviewedById: reviewer.reviewerId,
        reviewedByRole: reviewer.reviewerRole,
      },
    });

    revalidatePath("/requests");
    revalidatePath("/hr");
    revalidatePath("/admin");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Employee verification rejected successfully.",
    };
  } catch (error) {
    console.error("Reject employee verification error:", error);

    return {
      success: false,
      message: "Unable to reject employee verification.",
    };
  }
}
