type ExpensePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpensePage({ params }: ExpensePageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Expense Details</h1>

      <p>Expense ID: {id}</p>
    </main>
  );
}
