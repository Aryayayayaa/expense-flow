import RegisterForm from "@/features/auth/components/RegisterForm";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  if (session) {
    redirect("/expenses");
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <RegisterForm />
    </main>
  );
}
