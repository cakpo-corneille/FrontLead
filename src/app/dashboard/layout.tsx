import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { AuthProvider } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-[100dvh] w-full bg-gray-50 overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col min-h-0 min-w-0">
          <DashboardHeader />
          <main className="flex-1 min-h-0 overflow-y-auto p-4 pb-10 sm:p-6 sm:pb-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
