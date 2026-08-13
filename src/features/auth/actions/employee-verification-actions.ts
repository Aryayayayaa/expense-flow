"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createEmployeeVerificationRequest } from "../lib/employee-verification";

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

    if (session.user.role !== "EMPLOYEE") {
      return {
        success: false,
        message: "Only employees can submit identity verification.",
      };
    }

    const userId = Number(session.user.id);

    const existingRequest = await prisma.employeeVerificationRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message: "You already have a pending verification request.",
      };
    }

    await createEmployeeVerificationRequest({
      userId,
      proofUrl,
      proofPath,
    });

    revalidatePath("/profile");
    revalidatePath("/hr");

    return {
      success: true,
      message: "Identity verification request submitted successfully.",
    };
  } catch (error) {
    console.error("Create employee verification error:", error);

    return {
      success: false,
      message: "Unable to submit identity verification request.",
    };
  }
}

async function requireHr() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      message: "Unauthorized.",
    };
  }

  if (session.user.role !== "HR") {
    return {
      success: false as const,
      message: "You are not authorized to perform this action.",
    };
  }

  return {
    success: true as const,
    reviewerId: Number(session.user.id),
  };
}

export async function approveEmployeeVerificationAction(requestId: number) {
  try {
    const hr = await requireHr();

    if (!hr.success) {
      return hr;
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

    if (request.userId === hr.reviewerId) {
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
        reviewedById: hr.reviewerId,
        rejectionReason: null,
      },
    });

    revalidatePath("/hr");
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
    const hr = await requireHr();

    if (!hr.success) {
      return hr;
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

    if (request.userId === hr.reviewerId) {
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
        reviewedById: hr.reviewerId,
      },
    });

    revalidatePath("/hr");
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
