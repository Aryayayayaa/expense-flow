"use client";

type CategoryFilterProps = {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
};

export default function CategoryFilter({
  value,
  onChange,
  categories,
}: CategoryFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 rounded-lg border border-gray-300 bg-white px-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800"
    >
      <option value="">All Categories</option>

      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
