import Link from "next/link";

export default function Sidebar() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/expenses">Expenses</Link>
      <Link href="/approvals">Approvals</Link>
    </nav>
  );
}
