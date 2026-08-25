import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createExpenseAction } from "@/features/expenses/actions/expense-actions";

export async function POST(request: Request) {
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

    const formData = await request.formData();

    const result = await createExpenseAction(null, formData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST Expense API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to create expense.",
      },
      { status: 400 },
    );
  }
}
