type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <h1>Expense Details</h1>

      <p>Expense ID: {id}</p>
    </main>
  );
}
