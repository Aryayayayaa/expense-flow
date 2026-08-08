"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mb-6 flex w-full items-center justify-center text-gray-800 min-h-[50px]">
      <input
        type="text"
        placeholder="Search expenses..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 text-gray-800 w-full rounded-lg border border-gray-300 bg-white px-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
