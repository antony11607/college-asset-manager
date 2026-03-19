import { useState, useEffect } from "react";
import { Package, Clock, Wrench, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { Allocation, AssetRequest } from "@/types/index";
import { getAllocationsAPI, getRequestsAPI } from "@/services/api";

interface MaintenanceRequest {
  id: string;
  assetName: string;
  date: string;
  status: string;
  description: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  "In Progress": "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocData, reqData] = await Promise.all([
          getAllocationsAPI(user?.email),
          getRequestsAPI(user?.email),
        ]);
        setAllocations(allocData);
        setRequests(reqData);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const pendingRequests = requests.filter(r => r.status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your asset overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Allocations" value={allocations.length} icon={Package} color="primary" />
        <StatCard title="Pending Requests" value={pendingRequests.length} icon={Clock} color="warning" />
        <StatCard title="Total Requests" value={requests.length} icon={Wrench} color="info" />
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">My Allocated Assets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Issue Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No active allocations</td></tr>
              ) : allocations.map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-card-foreground">{a.assetName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.issueDate}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.returnDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Recent Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No requests yet</td></tr>
              ) : requests.slice(0, 5).map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-card-foreground">{r.assetName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.requestDate}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
