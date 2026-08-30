"use client";

type SupportRequestStatusFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SupportRequestStatusFilter({
  value,
  onChange,
}: SupportRequestStatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="support-request-status"
        className="text-sm font-medium text-slate-700"
      >
        Status
      </label>

      <select
        id="support-request-status"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
      >
        <option value="ALL">All</option>
        <option value="NEW">New</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="AWAITING_INFO">Awaiting Info</option>
        <option value="RESOLVED">Resolved</option>
      </select>
    </div>
  );
}
