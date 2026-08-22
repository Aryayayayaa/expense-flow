import { getExchangeRate } from "./exchange-rates";

type DisplayCurrencyExpense = {
  amount: number;
  currency: string;
  baseCurrencyAmount: number | null;
  exchangeRate: number | null;
};

/**
 * Converts an existing expense amount into the user's
 * current default currency without modifying the stored expense.
 *
 * Stored baseCurrencyAmount is normalized to INR.
 *
 * Conversion flow:
 *
 *   Same currency:
 *     expense amount → display amount
 *
 *   Non-INR expense:
 *     expense amount
 *       → historical INR amount
 *       → current default currency
 *
 *   INR expense:
 *     expense amount
 *       → current default currency
 */
export async function getDisplayExpenseAmount(
  expense: DisplayCurrencyExpense,
  defaultCurrency: string,
): Promise<number> {
  const sourceCurrency = expense.currency.trim().toUpperCase();
  const targetCurrency = defaultCurrency.trim().toUpperCase();

  if (!sourceCurrency || !targetCurrency) {
    throw new Error("Invalid expense or display currency.");
  }

  /*
   * No conversion is necessary when the expense was
   * originally created in the user's current default currency.
   */
  if (sourceCurrency === targetCurrency) {
    return Number(expense.amount);
  }

  /*
   * INR is the application's stored base currency.
   *
   * When the original expense is INR, we can directly
   * convert the original amount into the user's currency.
   */
  if (sourceCurrency === "INR") {
    const result = await getExchangeRate("INR", targetCurrency);

    return Number(expense.amount) * result.rate;
  }

  /*
   * For a non-INR expense, baseCurrencyAmount represents
   * the historical INR value stored when the expense was created.
   *
   * Example:
   *
   * USD 50
   * historical USD → INR conversion
   * baseCurrencyAmount = INR equivalent
   *
   * We then convert that stored INR amount into the
   * user's current default currency.
   */
  if (expense.baseCurrencyAmount !== null) {
    if (targetCurrency === "INR") {
      return Number(expense.baseCurrencyAmount);
    }

    const result = await getExchangeRate("INR", targetCurrency);

    return Number(expense.baseCurrencyAmount) * result.rate;
  }

  /*
   * Legacy/fallback case:
   *
   * If an old expense does not have a stored base-currency
   * amount, use the current exchange rate as a fallback.
   */
  if (expense.exchangeRate !== null) {
    const historicalInrAmount =
      Number(expense.amount) * Number(expense.exchangeRate);

    if (targetCurrency === "INR") {
      return historicalInrAmount;
    }

    const result = await getExchangeRate("INR", targetCurrency);

    return historicalInrAmount * result.rate;
  }

  throw new Error(
    `Unable to convert ${sourceCurrency} expense to ${targetCurrency}.`,
  );
}
