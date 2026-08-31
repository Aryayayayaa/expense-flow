"use client";

type MonthFilterProps = {
  value: string;
  selectedYear: string;
  onChange: (value: string) => void;
};

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function MonthFilter({
  value,
  selectedYear,
  onChange,
}: MonthFilterProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const isCurrentYearSelected =
    selectedYear !== "" && Number(selectedYear) === currentYear;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
    >
      <option value="">All Months</option>

      {months.map((month) => {
        const monthNumber = Number(month.value);

        const isDisabled = isCurrentYearSelected && monthNumber > currentMonth;

        return (
          <option key={month.value} value={month.value} disabled={isDisabled}>
            {month.label}
          </option>
        );
      })}
    </select>
  );
}
