import { useState } from "react";
import { initialAssets } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

interface AssetRequest {
  id: string;
  assetName: string;
  reason: string;
  requestDate: string;
  status: string;
}

const availableAssets = initialAssets.filter((a) => a.status === "Available");

export default function RequestAsset() {
  const [requests, setRequests] = useState<AssetRequest[]>([
    { id: "REQ-001", assetName: "MacBook Air M2", reason: "Project work", requestDate: "2025-03-01", status: "Pending" },
  ]);
  const [form, setForm] = useState({ assetId: "", reason: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = initialAssets.find((a) => a.id === form.assetId);
    const newReq: AssetRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
      assetName: asset?.name || "",
      reason: form.reason,
      requestDate: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setRequests([newReq, ...requests]);
    setForm({ assetId: "", reason: "" });
    toast({ title: "Success", description: "Asset request submitted" });
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-warning/10 text-warning",
    Approved: "bg-success/10 text-success",
    Rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Request Asset</h1>
        <p className="text-muted-foreground text-sm mt-1">Submit a request for an available asset</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
        <h2 className="font-semibold text-card-foreground mb-4">New Request</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Select Asset</label>
            <select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose asset</option>
              {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.category})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Reason</label>
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required placeholder="Why do you need this asset?" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Submit Request
          </button>
        </form>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">My Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
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
                  <td className="px-5 py-3 text-muted-foreground">{r.reason}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.requestDate}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>
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
