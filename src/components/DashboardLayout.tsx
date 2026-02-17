import { AppSidebar } from "./AppSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-border bg-card card-shadow">
          <MobileSidebar />
          <h2 className="text-lg font-semibold text-foreground">College Asset Management System</h2>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
