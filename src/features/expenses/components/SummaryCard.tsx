import { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
};

export default function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>

      <p className="mt-4 text-3xl font-bold">{value}</p>
    </div>
  );
}
