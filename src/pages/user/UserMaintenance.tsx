import { useState } from "react";
import { initialAllocations, initialAssets } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id: string;
  assetName: string;
  description: string;
  date: string;
  status: string;
}

// User can only request maintenance for their allocated assets
const myAssetIds = initialAllocations
  .filter((a) => a.userName === "Student - Rahul K.")
  .map((a) => a.assetId);
const myAssets = initialAssets.filter((a) => myAssetIds.includes(a.id));

export default function UserMaintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    { id: "MR-001", assetName: "BenQ GW2780", description: "Screen flickering issue", date: "2025-02-20", status: "In Progress" },
  ]);
  const [form, setForm] = useState({ assetId: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = initialAssets.find((a) => a.id === form.assetId);
    const newReq: MaintenanceRequest = {
      id: `MR-${String(requests.length + 1).padStart(3, "0")}`,
      assetName: asset?.name || "",
      description: form.description,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setRequests([newReq, ...requests]);
    setForm({ assetId: "", description: "" });
    toast({ title: "Success", description: "Maintenance request submitted" });
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-warning/10 text-warning",
    "In Progress": "bg-info/10 text-info",
    Completed: "bg-success/10 text-success",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Maintenance Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Report issues with your allocated assets</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
        <h2 className="font-semibold text-card-foreground mb-4">Report Issue</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Select Asset</label>
            <select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose asset</option>
              {myAssets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Describe the issue..." className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Submit
          </button>
        </form>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">My Maintenance Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                  <td className="px-5 py-3 font-medium text-card-foreground">{r.assetName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.description}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
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
