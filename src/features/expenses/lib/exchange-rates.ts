export type ExchangeRateResult = {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  rateDate: Date;
};

const FRANKFURTER_API_URL = "https://api.frankfurter.dev/v2";

export async function getExchangeRate(
  baseCurrency: string,
  quoteCurrency: string,
): Promise<ExchangeRateResult> {
  if (typeof baseCurrency !== "string" || typeof quoteCurrency !== "string") {
    throw new Error("Base and quote currencies must be valid strings.");
  }

  const base = baseCurrency.trim().toUpperCase();
  const quote = quoteCurrency.trim().toUpperCase();

  if (!base || !quote) {
    throw new Error("Base and quote currencies are required.");
  }

  if (base === quote) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: 1,
      rateDate: new Date(),
    };
  }
  const actionStart = performance.now();

  const sessionStart = performance.now();

  console.log(
    `[Expense Performance] exchange rate: ${(performance.now() - sessionStart).toFixed(2)}ms`,
  );
  const response = await fetch(
    `${FRANKFURTER_API_URL}/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let message = `Unable to fetch exchange rate for ${base}/${quote}.`;

    try {
      const errorData: unknown = await response.json();

      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData &&
        typeof errorData.message === "string"
      ) {
        message = errorData.message;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("rate" in data) ||
    typeof data.rate !== "number" ||
    !Number.isFinite(data.rate) ||
    data.rate <= 0
  ) {
    throw new Error(`Invalid exchange rate received for ${base}/${quote}.`);
  }

  let rateDate = new Date();

  if ("date" in data && typeof data.date === "string" && data.date.trim()) {
    const parsedDate = new Date(data.date);

    if (!Number.isNaN(parsedDate.getTime())) {
      rateDate = parsedDate;
    }
  }

  return {
    baseCurrency: base,
    quoteCurrency: quote,
    rate: data.rate,
    rateDate,
  };
}
