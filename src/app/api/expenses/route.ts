import { getExpenses } from "@/features/expenses/lib/expenses";
import { createExpense } from "@/features/expenses/lib/expenses";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const expenses = await getExpenses();
  return Response.json(expenses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const expense = await createExpense(body);
  return Response.json(expense, {
    status: 201,
  });
}
