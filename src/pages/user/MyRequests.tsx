import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getRequestsAPI } from "@/services/api";
import { AssetRequest } from "@/types/index";
import { toast } from "@/hooks/use-toast";

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        setLoading(true);
        const data = await getRequestsAPI(user?.email);
        setRequests(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch requests", variant: "destructive" });
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUserRequests();
  }, [user]);

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4 text-warning" />,
    approved: <CheckCircle2 className="w-4 h-4 text-success" />,
    rejected: <XCircle className="w-4 h-4 text-destructive" />,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

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
        <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your asset requests and their status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-foreground mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-5 h-5 text-warning" />
          </div>
        </div>
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-foreground mt-1">{approvedCount}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
        </div>
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-foreground mt-1">{rejectedCount}</p>
            </div>
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Request History</h2>
        </div>
        {requests.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-muted-foreground">No requests yet. Create one from Request Asset page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-5 py-3 font-medium text-card-foreground">{r.assetName}</td>
                    <td className="px-5 py-3 text-card-foreground text-center font-medium">{r.quantity}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.reason || "-"}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.requestDate}</td>
                    <td className="px-5 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[r.status]}`}>
                        {statusIcons[r.status]}
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-muted/30 rounded-xl border border-border/50 p-4">
        <h3 className="font-semibold text-card-foreground mb-3 text-sm">Status Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-muted-foreground">Pending - Awaiting admin review</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-muted-foreground">Approved - Ready for allocation</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-muted-foreground">Rejected - Request declined</span>
          </div>
        </div>
      </div>
    </div>
  );
}
