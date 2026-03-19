import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Asset } from "@/types/index";
import { categories } from "@/data/mockData";
import { getAssetsAPI, addAssetAPI, updateAssetAPI, deleteAssetAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Available: "bg-success/10 text-success",
  Allocated: "bg-info/10 text-info",
  Maintenance: "bg-warning/10 text-warning",
};

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState({ name: "", category: "", purchaseDate: "", status: "Available" as Asset["status"], location: "" });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssetsAPI();
        setAssets(data);
      } catch (error) {
        console.error("Fetch assets error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const openAdd = () => {
    setEditingAsset(null);
    setForm({ name: "", category: "", purchaseDate: "", status: "Available", location: "" });
    setModalOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({ name: asset.name, category: asset.category, purchaseDate: asset.purchaseDate, status: asset.status, location: asset.location });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        const updated = await updateAssetAPI({ ...editingAsset, ...form });
        setAssets(assets.map((a) => (a.id === editingAsset.id ? updated : a)));
        toast({ title: "Success", description: "Asset updated" });
      } else {
        const created = await addAssetAPI(form);
        setAssets([...assets, created]);
        toast({ title: "Success", description: "Asset added" });
      }
      setModalOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save asset", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssetAPI(id);
      setAssets(assets.filter((a) => a.id !== id));
      toast({ title: "Success", description: "Asset deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete asset", variant: "destructive" });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all college assets</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Purchase Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Location</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">No assets found</td></tr>
              ) : assets.map((asset) => (
                <tr key={asset.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{asset.id}</td>
                  <td className="px-5 py-3 font-medium text-card-foreground">{asset.name}</td>
                  <td className="px-5 py-3 text-card-foreground">{asset.category}</td>
                  <td className="px-5 py-3 text-muted-foreground">{asset.purchaseDate}</td>
                  <td className="px-5 py-3">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusColors[asset.status])}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{asset.location}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(asset)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-accent-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(asset.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card rounded-2xl card-shadow-lg border border-border/50 w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-card-foreground">{editingAsset ? "Edit Asset" : "Add New Asset"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-md hover:bg-accent">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Asset Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Purchase Date</label>
                  <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Asset["status"] })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Available">Available</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  {editingAsset ? "Update" : "Add Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
