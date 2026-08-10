"use client";

import { Expense } from "@prisma/client";

type OverviewSummaryCardsProps = {
  expenses: Expense[];
};

export default function OverviewSummaryCards({
  expenses,
}: OverviewSummaryCardsProps) {
  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + Number(expense.amount);
  }, 0);

  const transactionCount = expenses.length;

  const averageExpense =
    transactionCount > 0 ? totalExpenses / transactionCount : 0;

  const highestExpense =
    transactionCount > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0;

  const cards = [
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toFixed(2)}`,
    },
    {
      title: "Transactions",
      value: transactionCount.toString(),
    },
    {
      title: "Average Expense",
      value: `₹${averageExpense.toFixed(2)}`,
    },
    {
      title: "Highest Expense",
      value: `₹${highestExpense.toFixed(2)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">{card.title}</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
