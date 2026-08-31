import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import ProfileEditor from "@/features/auth/components/ProfileEditor";
import ProfileImageEditor from "@/features/auth/components/ProfileImageEditor";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    select: {
      name: true,
      email: true,
      role: true,
      image: true,
      defaultCurrency: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            View and manage your profile information.
          </p>
        </div>

        <ProfileImageEditor currentImage={user.image} />

        {/* Profile Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Profile Details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your current account information.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Name
              </p>

              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Email
              </p>

              <p className="mt-1 text-lg text-slate-900 dark:text-white">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Role
              </p>

              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Default Currency
              </p>

              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">
                {user.defaultCurrency}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Member Since
              </p>

              <p className="mt-1 text-lg text-slate-900 dark:text-white">
                {user.createdAt.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Profile Editing */}
        <ProfileEditor
          name={user.name}
          email={user.email}
          role={user.role}
          defaultCurrency={user.defaultCurrency}
        />
      </div>
    </main>
  );
}
