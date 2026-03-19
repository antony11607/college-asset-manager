import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Asset, Allocation } from "@/types/index";
import { getAssetsAPI, getAllocationsAPI, addMaintenanceAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id: string;
  assetName: string;
  description: string;
  date: string;
  status: string;
}

export default function UserMaintenance() {
  const { user } = useAuth();
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ assetId: "", description: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allAssets, allocations] = await Promise.all([
          getAssetsAPI(),
          getAllocationsAPI(user?.email),
        ]);
        const myAssetIds = allocations.map((a: Allocation) => a.assetId);
        setMyAssets(allAssets.filter((a: Asset) => myAssetIds.includes(a.id)));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const asset = myAssets.find((a) => a.id === form.assetId);
    try {
      await addMaintenanceAPI({
        assetId: form.assetId,
        assetName: asset?.name || "",
        serviceDate: new Date().toISOString().split("T")[0],
        description: form.description,
      });
      setForm({ assetId: "", description: "" });
      toast({ title: "Success", description: "Maintenance request submitted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" });
    }
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-warning/10 text-warning",
    "In Progress": "bg-info/10 text-info",
    Completed: "bg-success/10 text-success",
  };

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
    </div>
  );
}
