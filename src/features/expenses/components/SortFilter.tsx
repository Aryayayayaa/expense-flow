"use client";

type SortFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SortFilter({ value, onChange }: SortFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    >
      <option value="latest">Latest First</option>
      <option value="oldest">Oldest First</option>
      <option value="highest">Highest Amount</option>
      <option value="lowest">Lowest Amount</option>
      <option value="title-asc">Title (A-Z)</option>
      <option value="title-desc">Title (Z-A)</option>
    </select>
  );
}
