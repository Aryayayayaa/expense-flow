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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const expenseId = Number(id);

    if (!Number.isInteger(expenseId)) {
      return NextResponse.json(
        { error: "Invalid expense ID." },
        { status: 400 },
      );
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: Number(session.user.id),
      },
      select: {
        ocrReceiptPath: true,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found." },
        { status: 404 },
      );
    }

    if (!expense.ocrReceiptPath) {
      return NextResponse.json(
        { error: "No original receipt attached." },
        { status: 404 },
      );
    }

    const signedToken = await issueSignedToken({
      pathname: expense.ocrReceiptPath,
      operations: ["get"],
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      pathname: expense.ocrReceiptPath,
      operation: "get",
      access: "private",
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json({
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Original receipt view error:", error);

    return NextResponse.json(
      { error: "Unable to access original receipt." },
      { status: 500 },
    );
  }
}
