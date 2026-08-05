import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ExpenseFlow Dashboard",
  description: "Track company expenses and approvals efficiently.",
};

export default async function Dashboard() {
  return (
    <h1 className="text-3xl text-center font-bold">
      Welcome to the Dashboard!
    </h1>
  );
}
