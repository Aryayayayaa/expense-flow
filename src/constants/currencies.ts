export const SUPPORTED_CURRENCIES = [
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
  },
  {
    code: "AED",
    name: "United Arab Emirates Dirham",
    symbol: "د.إ",
  },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export const ALL_CURRENCIES = "ALL" as const;

export type CurrencyFilter = CurrencyCode | typeof ALL_CURRENCIES;
