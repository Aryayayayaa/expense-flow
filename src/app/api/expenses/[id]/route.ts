import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  deleteExpense,
  deleteExpenseAsAdmin,
} from "@/features/expenses/lib/expenses";

import { revalidatePath } from "next/cache";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    const expenseId = Number(id);

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid expense ID.",
        },
        { status: 400 },
      );
    }

    const userId = Number(session.user.id);

    if (session.user.role === "ADMIN") {
      let body: { deletionReason?: string } = {};

      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Deletion reason is required.",
          },
          { status: 400 },
        );
      }

      const deletionReason = body.deletionReason?.trim() ?? "";

      if (!deletionReason) {
        return NextResponse.json(
          {
            success: false,
            message: "Deletion reason is required.",
          },
          { status: 400 },
        );
      }

      await deleteExpenseAsAdmin(expenseId, userId, deletionReason);
    } else {
      await deleteExpense(expenseId, userId);
    }

    revalidatePath("/expenses");
    revalidatePath("/approvals");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE Expense API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to delete expense.",
      },
      { status: 400 },
    );
  }
}
