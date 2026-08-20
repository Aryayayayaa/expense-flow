"use client";

import {
  ALL_CURRENCIES,
  SUPPORTED_CURRENCIES,
  type CurrencyFilter as CurrencyFilterValue,
} from "@/constants/currencies";

type CurrencyFilterProps = {
  value: CurrencyFilterValue;
  onChange: (currency: CurrencyFilterValue) => void;
};

export default function CurrencyFilter({
  value,
  onChange,
}: CurrencyFilterProps) {
  return (
    <div className="flex min-w-[180px] flex-col gap-1">
      <select
        id="currency-filter"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as CurrencyFilterValue)
        }
        className="h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        <option value={ALL_CURRENCIES}>All Currencies</option>

        {SUPPORTED_CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} — {currency.name} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}
