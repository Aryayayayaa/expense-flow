import MobileSidebar from "@/features/dashboard/components/MobileSidebar";
import Sidebar from "@/features/dashboard/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <MobileSidebar />

      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </main>
  );
}