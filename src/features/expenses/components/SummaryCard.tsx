import { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
};

export default function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 break-words text-2xl font-bold text-slate-900 dark:text-white sm:text-md">
            {value}
          </p>
        </div>

        <div className="shrink-0 rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
