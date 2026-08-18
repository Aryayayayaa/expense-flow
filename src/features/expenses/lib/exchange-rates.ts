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

  const response = await fetch(
    `${FRANKFURTER_API_URL}/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to fetch exchange rate for ${base}/${quote}.`);
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

  const rateDate =
    "date" in data && typeof data.date === "string"
      ? new Date(data.date)
      : new Date();

  if (Number.isNaN(rateDate.getTime())) {
    throw new Error(
      `Invalid exchange-rate date received for ${base}/${quote}.`,
    );
  }

  return {
    baseCurrency: base,
    quoteCurrency: quote,
    rate: data.rate,
    rateDate,
  };
}
