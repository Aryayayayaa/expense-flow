"use client";

type AnalyticsTab =
  | "overview"
  | "categories"
  | "monthly"
  | "yearly";

type AnalyticsTabsProps = {
  activeTab: AnalyticsTab;
  onChange: (tab: AnalyticsTab) => void;
};

const tabs: { value: AnalyticsTab; label: string }[] = [
  {
    value: "overview",
    label: "Overview",
  },
  {
    value: "categories",
    label: "Categories",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "yearly",
    label: "Yearly",
  },
];

export default function AnalyticsTabs({
  activeTab,
  onChange,
}: AnalyticsTabsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-t-lg px-4 py-3 text-sm font-medium transition ${
            activeTab === tab.value
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}