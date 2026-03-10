import { UserSidebar } from "./UserSidebar";
import { UserMobileSidebar } from "./UserMobileSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function UserLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border bg-card card-shadow">
          <div className="flex items-center gap-3">
            <UserMobileSidebar />
            <h2 className="text-lg font-semibold text-foreground">User Dashboard</h2>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.name}</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
