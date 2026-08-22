import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { getExchangeRate } from "@/features/expenses/lib/exchange-rates";

import { AnalyticsExpense } from "../types";

export type AnalyticsScope = "OWN" | "ALL" | "EMPLOYEES";

async function getExpensesForAnalytics(scope: AnalyticsScope, userId: number) {
  if (scope === "OWN") {
    return prisma.expense.findMany({
      where: {
        userId,
      },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  if (scope === "EMPLOYEES") {
    return prisma.expense.findMany({
      where: {
        user: {
          role: "EMPLOYEE",
        },
      },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  return prisma.expense.findMany({
    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAnalyticsData(
  scope: AnalyticsScope = "OWN",
): Promise<AnalyticsExpense[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);
  const role = session.user.role;

  if (scope !== "OWN" && role !== "ADMIN" && role !== "HR") {
    throw new Error("Forbidden");
  }

  /*
   * The reporting/display currency always comes from the
   * authenticated user's current defaultCurrency.
   *
   * This is intentionally NOT derived from the selected
   * currency filter because the selected currency is a
   * client-side analysis filter.
   */
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      defaultCurrency: true,
    },
  });

  if (!user?.defaultCurrency) {
    throw new Error("User default currency is not configured.");
  }

  const defaultCurrency = user.defaultCurrency.trim().toUpperCase();

  const expenses = await getExpensesForAnalytics(scope, userId);

  /*
   * Get the current conversion rate for every unique
   * original expense currency.
   *
   * We only make one API request per currency pair instead
   * of one request per expense.
   */
  const currencies = [
    ...new Set(
      expenses.map((expense) => expense.currency.trim().toUpperCase()),
    ),
  ];

  const exchangeRates = new Map<
    string,
    {
      rate: number;
      rateDate: Date;
    }
  >();

  await Promise.all(
    currencies.map(async (currency) => {
      const result = await getExchangeRate(currency, defaultCurrency);

      exchangeRates.set(currency, {
        rate: result.rate,
        rateDate: result.rateDate,
      });
    }),
  );

  return expenses.map((expense) => {
    const originalCurrency = expense.currency.trim().toUpperCase();

    const displayExchangeRate = exchangeRates.get(originalCurrency);

    const convertedDisplayAmount = displayExchangeRate
      ? Number(expense.amount) * displayExchangeRate.rate
      : null;

    return {
      id: expense.id,
      title: expense.title,

      // Original transaction amount and currency.
      amount: Number(expense.amount),
      currency: originalCurrency,

      // Existing normalized/base-currency information.
      baseCurrencyAmount:
        expense.baseCurrencyAmount !== null
          ? Number(expense.baseCurrencyAmount)
          : null,

      exchangeRate:
        expense.exchangeRate !== null ? Number(expense.exchangeRate) : null,

      exchangeRateAt: expense.exchangeRateAt,

      // Current reporting conversion.
      convertedDisplayAmount,
      displayExchangeRate: displayExchangeRate?.rate ?? null,
      displayExchangeRateAt: displayExchangeRate?.rateDate ?? null,

      category: expense.category,

      status: expense.status,
      reimbursementStatus: expense.reimbursementStatus,

      expenseDate: expense.expenseDate,
      billProofUrl: expense.billProofUrl,
      billProofPath: expense.billProofPath,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      userId: expense.userId,
    };
  });
}
