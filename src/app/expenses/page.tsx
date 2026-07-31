import AddExpenseButton from "@/components/expenses/AddExpenseButton";

export default function ExpensesPage() {
  return (
    <main>
      <h1 className="text-center" style={{ fontSize: "30px" }}>
        Expenses
      </h1>
      <hr />
      <br />
      <AddExpenseButton />
    </main>
  );
}
