import Link from "next/link";

export default function Sidebar() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/expenses">My Expenses</Link>
      <Link href="/expenses/new">New Expenses</Link>
      <Link href="/approvals">Approvals</Link>
      <Link href="/insights">Insights</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/requests">Claims</Link>
      {/* <Link href="/logout">Logout</Link> */}
    </nav>
  );
}
