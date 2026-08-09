import { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
};

export default function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm m-2">
      <div
        className="gap-2 text-gray-500"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
      >
        {icon}
        <span className="text-xl text-black font-bold pb-3">{title}</span>
      </div>

      <p className="mt-4 text-3xl text-gray-700 font-bold p-3 mt-4">{value}</p>
    </div>
  );
}
