import { getExpenses } from "@/lib/expenses";
import { createExpense } from "@/lib/expenses";
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
