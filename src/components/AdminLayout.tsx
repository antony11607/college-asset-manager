import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileSidebar } from "./AdminMobileSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getRequestsAPI } from "@/services/api";
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

export function AdminLayout() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await getRequestsAPI();
        setPendingCount(data.filter(r => r.status === "pending").length);
      } catch { /* silent */ }
    };
    fetchPending();
    pollingRef.current = setInterval(fetchPending, 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border bg-card card-shadow">
          <div className="flex items-center gap-3">
            <AdminMobileSidebar />
            <h2 className="text-lg font-semibold text-foreground">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
