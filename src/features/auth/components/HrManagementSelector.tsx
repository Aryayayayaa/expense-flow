"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Section =
  | "verification"
  | "reimbursement"
  | "name-change"
  | "role-verification";

type Props = {
  section: Section;
};

const sections: { value: Section; label: string }[] = [
  {
    value: "verification",
    label: "Employee Verification",
  },
  {
    value: "name-change",
    label: "Name Change Requests",
  },
  {
    value: "role-verification",
    label: "Role Verification Requests",
  },
  {
    value: "reimbursement",
    label: "Reimbursement",
  },
];

export default function HrManagementSelector({ section }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: Section) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("section", value);

    router.push(`/hr?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label
        htmlFor="hr-management-section"
        className="block text-sm font-medium text-slate-700"
      >
        People Management
      </label>

      <select
        id="hr-management-section"
        value={section}
        onChange={(event) => handleChange(event.target.value as Section)}
        className="mt-2 h-12 w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        {sections.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
