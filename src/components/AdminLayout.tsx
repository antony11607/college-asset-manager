import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileSidebar } from "./AdminMobileSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getRequestsAPI } from "@/services/api";
import { useState, useEffect, useRef } from "react";
import { Bell, Clock, Package, X } from "lucide-react";
import type { AssetRequest } from "@/types/index";

export function AdminLayout() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AssetRequest[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await getRequestsAPI();
        setPendingRequests(data.filter(r => r.status === "pending"));
      } catch { /* silent */ }
    };
    fetchPending();
    pollingRef.current = setInterval(fetchPending, 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {pendingRequests.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl card-shadow-md z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    <button onClick={() => setDropdownOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {pendingRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4">
                        <Bell className="w-8 h-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    ) : (
                      pendingRequests.map((r) => (
                        <div key={r.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                          <div className="mt-0.5 p-1.5 rounded-full bg-warning/10">
                            <Clock className="w-3.5 h-3.5 text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {r.userName} requested {r.assetName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{r.requestDate}</span>
                              <span className="text-xs text-warning font-medium">Pending</span>
                            </div>
                          </div>
                          <Package className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
