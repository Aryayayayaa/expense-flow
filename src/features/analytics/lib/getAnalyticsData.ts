import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { getExchangeRate } from "@/features/expenses/lib/exchange-rates";

import type { AnalyticsExpense } from "../types";

export type AnalyticsScope =
  | "OWN"
  | "ALL"
  | "EMPLOYEES"
  | "OTHER_ADMINS"
  | "HRS"
  | "OTHER_HRS"
  | "ADMINS";

async function getExpensesForAnalytics(
  scope: AnalyticsScope,
  userId: number,
  role: "ADMIN" | "HR" | "EMPLOYEE",
) {
  /*
   * ---------------------------------------------------------
   * OWN
   * ---------------------------------------------------------
   *
   * Only the currently authenticated user's expenses.
   */
  if (scope === "OWN") {
    return prisma.expense.findMany({
      where: {
        userId,
      },

      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  /*
   * ---------------------------------------------------------
   * EMPLOYEES
   * ---------------------------------------------------------
   *
   * Expenses belonging to all EMPLOYEE accounts.
   */
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

  /*
   * ---------------------------------------------------------
   * OTHER_ADMINS
   * ---------------------------------------------------------
   *
   * Only available to ADMIN.
   *
   * Includes expenses belonging to other ADMIN users,
   * excluding the currently authenticated ADMIN.
   */
  if (scope === "OTHER_ADMINS") {
    if (role !== "ADMIN") {
      throw new Error("Forbidden");
    }

    return prisma.expense.findMany({
      where: {
        user: {
          role: "ADMIN",
          id: {
            not: userId,
          },
        },
      },

      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  /*
   * ---------------------------------------------------------
   * HRS
   * ---------------------------------------------------------
   *
   * Only available to ADMIN.
   *
   * Includes expenses belonging to all HR users.
   */
  if (scope === "HRS") {
    if (role !== "ADMIN") {
      throw new Error("Forbidden");
    }

    return prisma.expense.findMany({
      where: {
        user: {
          role: "HR",
        },
      },

      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  /*
   * ---------------------------------------------------------
   * OTHER_HRS
   * ---------------------------------------------------------
   *
   * Only available to HR.
   *
   * Includes expenses belonging to other HR users,
   * excluding the currently authenticated HR.
   */
  if (scope === "OTHER_HRS") {
    if (role !== "HR") {
      throw new Error("Forbidden");
    }

    return prisma.expense.findMany({
      where: {
        user: {
          role: "HR",
          id: {
            not: userId,
          },
        },
      },

      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  /*
   * ---------------------------------------------------------
   * ADMINS
   * ---------------------------------------------------------
   *
   * Only available to HR.
   *
   * Includes expenses belonging to all ADMIN users.
   */
  if (scope === "ADMINS") {
    if (role !== "HR") {
      throw new Error("Forbidden");
    }

    return prisma.expense.findMany({
      where: {
        user: {
          role: "ADMIN",
        },
      },

      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    });
  }

  /*
   * ---------------------------------------------------------
   * ALL
   * ---------------------------------------------------------
   *
   * Includes expenses from every user.
   */
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

  /*
   * ---------------------------------------------------------
   * Validate scope against the authenticated user's role.
   * ---------------------------------------------------------
   *
   * EMPLOYEE:
   *   OWN only
   *
   * ADMIN:
   *   OWN
   *   ALL
   *   EMPLOYEES
   *   OTHER_ADMINS
   *   HRS
   *
   * HR:
   *   OWN
   *   ALL
   *   EMPLOYEES
   *   OTHER_HRS
   *   ADMINS
   */
  if (role === "EMPLOYEE" && scope !== "OWN") {
    throw new Error("Forbidden");
  }

  if (
    role === "ADMIN" &&
    !["OWN", "ALL", "EMPLOYEES", "OTHER_ADMINS", "HRS"].includes(scope)
  ) {
    throw new Error("Forbidden");
  }

  if (
    role === "HR" &&
    !["OWN", "ALL", "EMPLOYEES", "OTHER_HRS", "ADMINS"].includes(scope)
  ) {
    throw new Error("Forbidden");
  }

  /*
   * The authenticated user's CURRENT default currency
   * is the reporting/display currency.
   *
   * This is independent from the currency filter selected
   * later on the client.
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

  const expenses = await getExpensesForAnalytics(scope, userId, role);

  /*
   * We only need current conversion rates for currencies
   * that actually require conversion.
   *
   * The conversion basis is:
   *
   *   Original expense
   *        ↓
   *   historical/base INR amount
   *        ↓
   *   current default currency
   *
   * This keeps Analytics consistent with /expenses.
   */
  const currenciesRequiringConversion = [
    ...new Set(
      expenses
        .map((expense) => expense.currency.trim().toUpperCase())
        .filter((currency) => currency !== defaultCurrency),
    ),
  ];

  const exchangeRates = new Map<
    string,
    {
      rate: number;
      rateDate: Date;
    }
  >();

  /*
   * We use INR as the stored base currency.
   *
   * Therefore the current conversion needed is:
   *
   * INR -> user's current default currency
   */
  if (defaultCurrency !== "INR" && currenciesRequiringConversion.length > 0) {
    const result = await getExchangeRate("INR", defaultCurrency);

    exchangeRates.set("INR_TO_DEFAULT", {
      rate: result.rate,
      rateDate: result.rateDate,
    });
  }

  return expenses.map((expense): AnalyticsExpense => {
    const originalCurrency = expense.currency.trim().toUpperCase();

    const amount = Number(expense.amount);

    const baseCurrencyAmount =
      expense.baseCurrencyAmount !== null
        ? Number(expense.baseCurrencyAmount)
        : originalCurrency === "INR"
          ? amount
          : null;

    const exchangeRate =
      expense.exchangeRate !== null ? Number(expense.exchangeRate) : null;

    /*
     * Same currency:
     *
     * Original amount is already in the user's
     * current default currency.
     */
    if (originalCurrency === defaultCurrency) {
      return {
        id: expense.id,
        title: expense.title,

        amount,
        currency: originalCurrency,

        baseCurrencyAmount,
        exchangeRate,
        exchangeRateAt: expense.exchangeRateAt,

        convertedDisplayAmount: amount,
        displayExchangeRate: 1,
        displayExchangeRateAt: null,

        category: expense.category,

        status: expense.status,
        reimbursementStatus: expense.reimbursementStatus,

        expenseDate: expense.expenseDate,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,

        userId: expense.userId,
      };
    }

    /*
     * If there is no historical/base INR amount for a
     * non-default currency expense, we cannot safely
     * represent it in the current default currency.
     *
     * Do NOT silently treat the original amount as though
     * it were already in the default currency.
     */
    if (baseCurrencyAmount === null) {
      return {
        id: expense.id,
        title: expense.title,

        amount,
        currency: originalCurrency,

        baseCurrencyAmount: null,
        exchangeRate,
        exchangeRateAt: expense.exchangeRateAt,

        convertedDisplayAmount: null,
        displayExchangeRate: null,
        displayExchangeRateAt: null,

        category: expense.category,

        status: expense.status,
        reimbursementStatus: expense.reimbursementStatus,

        expenseDate: expense.expenseDate,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,

        userId: expense.userId,
      };
    }

    /*
     * Default currency is INR.
     *
     * The historical/base INR amount is already in
     * the required reporting currency.
     */
    if (defaultCurrency === "INR") {
      return {
        id: expense.id,
        title: expense.title,

        amount,
        currency: originalCurrency,

        baseCurrencyAmount,
        exchangeRate,
        exchangeRateAt: expense.exchangeRateAt,

        convertedDisplayAmount: baseCurrencyAmount,
        displayExchangeRate: 1,
        displayExchangeRateAt: null,

        category: expense.category,

        status: expense.status,
        reimbursementStatus: expense.reimbursementStatus,

        expenseDate: expense.expenseDate,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,

        userId: expense.userId,
      };
    }

    /*
     * Non-INR default currency.
     *
     * Example:
     *
     * historical/base amount = INR 5,000
     * current default currency = EUR
     * INR -> EUR rate = 0.00894
     *
     * display amount = 5,000 × 0.00894
     */
    const displayRate = exchangeRates.get("INR_TO_DEFAULT");

    if (!displayRate) {
      return {
        id: expense.id,
        title: expense.title,

        amount,
        currency: originalCurrency,

        baseCurrencyAmount,
        exchangeRate,
        exchangeRateAt: expense.exchangeRateAt,

        convertedDisplayAmount: null,
        displayExchangeRate: null,
        displayExchangeRateAt: null,

        category: expense.category,

        status: expense.status,
        reimbursementStatus: expense.reimbursementStatus,

        expenseDate: expense.expenseDate,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,

        userId: expense.userId,
      };
    }

    return {
      id: expense.id,
      title: expense.title,

      amount,
      currency: originalCurrency,

      baseCurrencyAmount,
      exchangeRate,
      exchangeRateAt: expense.exchangeRateAt,

      convertedDisplayAmount: baseCurrencyAmount * displayRate.rate,
      displayExchangeRate: displayRate.rate,
      displayExchangeRateAt: displayRate.rateDate,

      category: expense.category,

      status: expense.status,
      reimbursementStatus: expense.reimbursementStatus,

      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,

      userId: expense.userId,
    };
  });
}
