"use client";

type YearFilterProps = {
  value: string;
  years: number[];
  onChange: (value: string) => void;
};

export default function YearFilter({
  value,
  years,
  onChange,
}: YearFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
    >
      <option value="">All Years</option>

      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}
