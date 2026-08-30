"use client";

type DateFilterProps = {
  value: string;
  onChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  minDate: string;
  maxDate: string;
  disablePresets?: boolean;
};

export default function DateFilter({
  value,
  onChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  disablePresets = false,
}: DateFilterProps) {
  return (
    <div className="flex min-w-0 w-full flex-col gap-3">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
      >
        <option value="all">All Time</option>

        <option value="today" disabled={disablePresets}>
          Today
        </option>

        <option value="yesterday" disabled={disablePresets}>
          Yesterday
        </option>

        <option value="last-7-days" disabled={disablePresets}>
          Last 7 Days
        </option>

        <option value="last-30-days" disabled={disablePresets}>
          Last 30 Days
        </option>

        <option value="this-month" disabled={disablePresets}>
          This Month
        </option>

        <option value="last-month" disabled={disablePresets}>
          Last Month
        </option>

        <option value="this-year" disabled={disablePresets}>
          This Year
        </option>

        <option value="custom">Custom Range</option>
      </select>

      {value === "custom" && (
        <div className="h-auto min-h-40 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-200">
            Custom Date Range
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-slate-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-slate-300">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || minDate}
                max={maxDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
