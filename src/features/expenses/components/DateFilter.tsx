"use client";

type DateFilterProps = {
  value: string;
  onChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  minDate: string;
};

export default function DateFilter({
  value,
  onChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
}: DateFilterProps) {
  return (
    <div className="flex flex-col gap-3">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last-7-days">Last 7 Days</option>
        <option value="last-30-days">Last 30 Days</option>
        <option value="this-month">This Month</option>
        <option value="last-month">Last Month</option>
        <option value="this-year">This Year</option>
        <option value="custom">Custom Range</option>
      </select>

      {value === "custom" && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-800 shadow-sm">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Custom Date Range
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={minDate}
                max={endDate || undefined}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || minDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
