import { NextResponse } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const requestId = Number(id);

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        { error: "Invalid verification request ID." },
        { status: 400 },
      );
    }

    const verificationRequest =
      await prisma.employeeVerificationRequest.findUnique({
        where: {
          id: requestId,
        },
        select: {
          userId: true,
          proofPath: true,
          status: true,
        },
      });

    if (!verificationRequest) {
      return NextResponse.json(
        {
          error: "Employee verification request not found.",
        },
        { status: 404 },
      );
    }

    const currentUserId = Number(session.user.id);

    const isOwner = verificationRequest.userId === currentUserId;
    const isHr = session.user.role === "HR";
    const isAdmin = session.user.role === "ADMIN";

    /*
     * Employees may only view their own verification proof.
     * HR and ADMIN may view verification proofs for review.
     */
    if (!isOwner && !isHr && !isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (!verificationRequest.proofPath) {
      return NextResponse.json(
        {
          error: "No verification proof attached.",
        },
        { status: 404 },
      );
    }

    const signedToken = await issueSignedToken({
      pathname: verificationRequest.proofPath,
      operations: ["get"],
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      pathname: verificationRequest.proofPath,
      operation: "get",
      access: "private",
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json({
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Employee verification proof view error:", error);

    return NextResponse.json(
      {
        error: "Unable to access verification proof.",
      },
      { status: 500 },
    );
  }
}
