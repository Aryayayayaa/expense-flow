import LoginForm from "@/features/auth/components/LoginForm";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/expenses");
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <LoginForm />
    </main>
  );
}
