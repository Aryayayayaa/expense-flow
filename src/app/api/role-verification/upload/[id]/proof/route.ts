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

    if (session.user.role !== "HR") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const requestId = Number(id);

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        { error: "Invalid role request ID." },
        { status: 400 },
      );
    }

    const roleRequest = await prisma.roleVerificationRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        proofPath: true,
        status: true,
      },
    });

    if (!roleRequest) {
      return NextResponse.json(
        { error: "Role verification request not found." },
        { status: 404 },
      );
    }

    if (!roleRequest.proofPath) {
      return NextResponse.json(
        { error: "No verification proof attached." },
        { status: 404 },
      );
    }

    const signedToken = await issueSignedToken({
      pathname: roleRequest.proofPath,
      operations: ["get"],
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      pathname: roleRequest.proofPath,
      operation: "get",
      access: "private",
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json({
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Role verification proof view error:", error);

    return NextResponse.json(
      { error: "Unable to access verification proof." },
      { status: 500 },
    );
  }
}
