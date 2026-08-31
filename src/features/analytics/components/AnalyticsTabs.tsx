"use client";

export type AnalyticsTab = "categories" | "monthly-yearly";

type AnalyticsTabsProps = {
  activeTab: AnalyticsTab;
  onChange: (tab: AnalyticsTab) => void;
};

const tabs: { value: AnalyticsTab; label: string }[] = [
  {
    value: "categories",
    label: "Categories",
  },
  {
    value: "monthly-yearly",
    label: "Monthly & Yearly Graphs",
  },
];

export default function AnalyticsTabs({
  activeTab,
  onChange,
}: AnalyticsTabsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-t-lg px-4 py-3 text-sm font-medium transition ${
            activeTab === tab.value
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
