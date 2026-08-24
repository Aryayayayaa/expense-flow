"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { ReimbursementExpenseScope } from "../lib/expenses";

type Props = {
  scope: ReimbursementExpenseScope;
  basePath: "/admin" | "/hr";
};

export default function ReimbursementScopeSelector({ scope, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options: {
    value: ReimbursementExpenseScope;
    label: string;
  }[] =
    basePath === "/admin"
      ? [
          {
            value: "OWN",
            label: "Own Expenses",
          },
          {
            value: "EMPLOYEES",
            label: "Employees",
          },
          {
            value: "OTHER_ADMINS",
            label: "Other Admins",
          },
          {
            value: "HRS",
            label: "HRs",
          },
        ]
      : [
          {
            value: "OWN",
            label: "Own Expenses",
          },
          {
            value: "EMPLOYEES",
            label: "Employees",
          },
          {
            value: "OTHER_HRS",
            label: "Other HRs",
          },
          {
            value: "ADMINS",
            label: "Admins",
          },
        ];

  function handleChange(value: ReimbursementExpenseScope) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("reimbursementScope", value);

    // Changing scope should always restart both tables from page 1.
    params.set("reimbursementPage", "1");
    params.set("reimbursementHistoryPage", "1");

    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <label
        htmlFor="reimbursement-scope"
        className="block text-sm font-medium text-slate-700"
      >
        Expense Scope
      </label>

      <select
        id="reimbursement-scope"
        value={scope}
        onChange={(event) =>
          handleChange(event.target.value as ReimbursementExpenseScope)
        }
        className="mt-2 h-11 w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
