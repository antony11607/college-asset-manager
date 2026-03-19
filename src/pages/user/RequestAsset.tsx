import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Asset } from "@/types/index";
import { getAssetsAPI, requestAssetAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function RequestAsset() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ assetId: "", quantity: 1, reason: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssetsAPI();
        setAssets(data.filter(a => a.status === "Available"));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
      return;
    }
    const asset = assets.find((a) => a.id === form.assetId);
    if (!asset) {
      toast({ title: "Error", description: "Asset not found", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await requestAssetAPI({
        user_id: user.email,
        asset_id: form.assetId,
        quantity: form.quantity,
        reason: form.reason,
      });
      setForm({ assetId: "", quantity: 1, reason: "" });
      toast({ title: "Success", description: `Request submitted for ${asset.name}. Admin will review shortly.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
        <h1 className="text-2xl font-bold text-foreground">Request Asset</h1>
        <p className="text-muted-foreground text-sm mt-1">Submit a request for an available asset to be reviewed and approved by admin</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
        <h2 className="font-semibold text-card-foreground mb-4">New Request</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Select Asset *</label>
            <select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Quantity *</label>
            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })} min="1" required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Reason *</label>
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required placeholder="Why do you need this?" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={submitting} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      <div className="bg-primary/10 rounded-xl border border-primary/20 p-4">
        <p className="text-sm text-primary font-medium">ℹ️ How the approval process works:</p>
        <ul className="text-xs text-primary/80 mt-2 space-y-1 list-disc list-inside">
          <li>Submit your request with the asset you need and the reason</li>
          <li>Admin will review your request and either approve or reject it</li>
          <li>Check <strong>My Requests</strong> page to see the status of your requests</li>
          <li>Once approved, the asset will be allocated to you</li>
        </ul>
      </div>
    </div>
  );
}
