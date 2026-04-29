import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { ChatWidget } from "@/components/dashboard/chat-widget";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ThemeProvider, themeInitScript } from "@/contexts/theme-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ThemeProvider defaultTheme="dark">
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
          <div
            data-theme-root
            className="dark flex min-h-screen supports-[height:100dvh]:h-[100dvh] w-full bg-background text-foreground font-body"
          >
            <DashboardSidebar />
            <div className="flex flex-1 flex-col min-h-0 min-w-0 relative">
              <DashboardHeader />
              <main
                className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-[88px] sm:pb-6 md:pb-8 lg:pb-10 scrollbar-hide"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
                <div className="max-w-[1600px] mx-auto">
                  {children}
                </div>
              </main>
              <BottomNav />
            </div>
            <ChatWidget />
          </div>
        </ThemeProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
