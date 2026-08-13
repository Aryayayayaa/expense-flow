import MobileSidebar from "@/features/dashboard/components/MobileSidebar";
import Sidebar from "@/features/dashboard/components/Sidebar";
import DashboardHeaderActions from "@/features/dashboard/components/DashboardHeaderActions";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <MobileSidebar
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="flex min-h-screen">
        <Sidebar userRole={session?.user?.role} />

        <div className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
            <DashboardHeaderActions />
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
