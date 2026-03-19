import { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { AssetRequest } from "@/types/index";
import { approveRequestAPI, rejectRequestAPI, getRequestsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function AssetRequests() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastCountRef = useRef(0);

  const fetchRequests = async (showToast = true) => {
    try {
      const data = await getRequestsAPI();
      setRequests(data);
      if (showToast && data.length > lastCountRef.current && lastCountRef.current > 0) {
        toast({ title: "New Asset Request", description: `${data.length - lastCountRef.current} new request(s) received` });
      }
      lastCountRef.current = data.length;
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(false);
    pollingRef.current = setInterval(() => fetchRequests(true), 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleApprove = async (requestId: string, request: AssetRequest) => {
    setApproving(requestId);
    try {
      await approveRequestAPI({ request_id: requestId });
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: "approved" as const } : r));
      toast({ title: "Request Approved", description: `${request.assetName} approved for ${request.userName}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve request", variant: "destructive" });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (requestId: string, request: AssetRequest) => {
    setRejecting(requestId);
    try {
      await rejectRequestAPI({ request_id: requestId });
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: "rejected" as const } : r));
      toast({ title: "Request Rejected", description: `${request.assetName} request from ${request.userName} has been rejected` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
    } finally {
      setRejecting(null);
    }
  };

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

  const pendingRequests = requests.filter(r => r.status === "pending");
  const processedRequests = requests.filter(r => r.status !== "pending");

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
        <h1 className="text-2xl font-bold text-foreground">Asset Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and approve asset requests from users</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-warning/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h2 className="font-semibold text-card-foreground">Pending Requests ({pendingRequests.length})</h2>
          </div>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Qty</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-5 py-3 font-medium text-card-foreground">{r.userName}</td>
                    <td className="px-5 py-3 text-card-foreground">{r.assetName}</td>
                    <td className="px-5 py-3 text-card-foreground text-center font-medium">{r.quantity}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.requestDate}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.reason || "-"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(r.id, r)} disabled={approving === r.id} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                          {approving === r.id ? "Approving..." : "Approve"}
                        </button>
                        <button onClick={() => handleReject(r.id, r)} disabled={rejecting === r.id} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                          {rejecting === r.id ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {processedRequests.length > 0 && (
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-card-foreground">Processed Requests ({processedRequests.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {processedRequests.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-5 py-3 font-medium text-card-foreground">{r.userName}</td>
                    <td className="px-5 py-3 text-card-foreground">{r.assetName}</td>
                    <td className="px-5 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[r.status]}`}>
                        {statusIcons[r.status]}
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.requestDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
