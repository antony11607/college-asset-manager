import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { initialAssets } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { requestAssetAPI } from "@/services/api";
import { Send } from "lucide-react";

interface AssetRequest {
  id: string;
  assetName: string;
  quantity: number;
  reason: string;
  requestDate: string;
  status: string;
}

const availableAssets = initialAssets.filter((a) => a.status === "Available");

export default function RequestAsset() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AssetRequest[]>([
    { id: "REQ-001", assetName: "MacBook Air M2", quantity: 1, reason: "Project work", requestDate: "2025-03-01", status: "Pending" },
  ]);
  const [form, setForm] = useState({ assetId: "", quantity: 1, reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const asset = initialAssets.find((a) => a.id === form.assetId);
    
    if (!asset) {
      toast({
        title: "Error",
        description: "Asset not found",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Call API to create request
      // await requestAssetAPI({
      //   user_id: user.email,
      //   asset_id: form.assetId,
      //   quantity: form.quantity,
      //   reason: form.reason,
      // });

      const newReq: AssetRequest = {
        id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
        assetName: asset.name,
        quantity: form.quantity,
        reason: form.reason,
        requestDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      };
      
      setRequests([newReq, ...requests]);
      setForm({ assetId: "", quantity: 1, reason: "" });
      
      toast({
        title: "Success",
        description: `Request submitted for ${asset.name}. Admin will review shortly.`,
      });

      // Notify admin (in real app, this would be done via backend notification)
      // Admin will see toast: "New Asset Request from [User]" on their dashboard via polling
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-warning/10 text-warning border-warning/20",
    Approved: "bg-success/10 text-success border-success/20",
    Rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Request Asset</h1>
        <p className="text-muted-foreground text-sm mt-1">Submit a request for an available asset to be reviewed and approved by admin</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
        <h2 className="font-semibold text-card-foreground mb-4">New Request</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Select Asset *</label>
            <select 
              value={form.assetId} 
              onChange={(e) => setForm({ ...form, assetId: e.target.value })} 
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose asset</option>
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Quantity *</label>
            <input 
              type="number" 
              value={form.quantity} 
              onChange={(e) => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })} 
              min="1" 
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Reason *</label>
            <input 
              value={form.reason} 
              onChange={(e) => setForm({ ...form, reason: e.target.value })} 
              required 
              placeholder="Why do you need this?" 
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-primary/10 rounded-xl border border-primary/20 p-4">
        <p className="text-sm text-primary font-medium">ℹ️ How the approval process works:</p>
        <ul className="text-xs text-primary/80 mt-2 space-y-1 list-disc list-inside">
          <li>Submit your request with the asset you need and the reason</li>
          <li>Admin will review your request and either approve or reject it</li>
          <li>Check <strong>My Requests</strong> page to see the status of your requests</li>
          <li>Once approved, the asset will be allocated to you</li>
        </ul>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">My Requests</h2>
        </div>
        {requests.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-muted-foreground">No requests yet. Create one above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Qty</th>
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
                    <td className="px-5 py-3 text-card-foreground font-medium">{r.quantity}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.reason}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.requestDate}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
