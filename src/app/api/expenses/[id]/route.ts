import { prisma } from "@/lib/prisma";
import {
  deleteExpense,
  getExpense,
  updateExpense,
} from "@/features/expenses/lib/expenses";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const expense = getExpense(Number(id));
    if (!expense) {
      return Response.json(
        {
          error: "Expense not found",
        },
        {
          status: 404,
        },
      );
    }
    return Response.json(expense);
  } catch {
    return Response.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const expense = await updateExpense(Number(id), body);
  return Response.json(expense);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  await deleteExpense(Number(id));
  return Response.json(
    {
      message: "Expense deleted successfully",
    },
    {
      status: 200,
    },
  );
}
