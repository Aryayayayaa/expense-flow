import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
  RECEIPT_MAX_SIZE_BYTES,
  isSupportedReceiptMimeType,
} from "@/features/expenses/lib/receipt-constants";
import {
  getReceiptViewUrl,
  uploadReceiptToCloudinary,
} from "@/features/expenses/lib/receipt-storage";

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

    const userId = Number(session.user.id);
    const role = session.user.role;

    /*
     * Employees can only view their own expenses.
     *
     * Admin and HR can review expenses belonging to other users.
     */
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        ...(role === "ADMIN" || role === "HR"
          ? {}
          : {
              userId,
            }),
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

    const url = await getReceiptViewUrl(expense.ocrReceiptPath);

    return NextResponse.json({
      url,
    });
  } catch (error) {
    console.error("Original receipt view error:", error);

    return NextResponse.json(
      { error: "Unable to access original receipt." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
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

    const userId = Number(session.user.id);
    const role = session.user.role;

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found." },
        { status: 404 },
      );
    }

    if (expense.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending expenses can have their receipt updated." },
        { status: 400 },
      );
    }

    if (role !== "ADMIN" && expense.userId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to update this expense receipt." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A receipt file is required." },
        { status: 400 },
      );
    }

    if (!isSupportedReceiptMimeType(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported receipt format. Please upload JPG, PNG, WEBP, or PDF.",
        },
        { status: 400 },
      );
    }

    if (file.size > RECEIPT_MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Receipt must be 10MB or smaller." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await uploadReceiptToCloudinary({
      buffer,
      mimeType: file.type,
      expenseId,
    });

    return NextResponse.json({
      url: uploaded.url,
      path: uploaded.path,
    });
  } catch (error) {
    console.error("Original receipt upload error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload original receipt.",
      },
      { status: 500 },
    );
  }
}
