"use client";

import { useRouter } from "next/navigation";

type ReportsPageClientProps = {
  scope: "OWN" | "ALL" | "EMPLOYEES";
};

export default function ReportsPageClient({ scope }: ReportsPageClientProps) {
  const router = useRouter();

  return (
    <div className="max-w-xs">
      <label
        htmlFor="report-scope"
        className="mb-1 block text-xs font-medium text-gray-600"
      >
        Expense Scope
      </label>

      <select
        id="report-scope"
        value={scope}
        onChange={(event) => {
          router.push(`/reports?scope=${event.target.value}`);
        }}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
      >
        <option value="OWN">OWN</option>
        <option value="ALL">ALL</option>
        <option value="EMPLOYEES">EMPLOYEES</option>
      </select>
    </div>
  );
}
