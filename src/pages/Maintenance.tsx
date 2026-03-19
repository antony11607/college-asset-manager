import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { MaintenanceRecord, Asset } from "@/types/index";
import { getMaintenanceAPI, addMaintenanceAPI, getAssetsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function Maintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ assetId: "", serviceDate: "", description: "" });
  const [dateError, setDateError] = useState<string | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maintData, assetData] = await Promise.all([getMaintenanceAPI(), getAssetsAPI()]);
        setRecords(maintData);
        setAssets(assetData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateDate = (): boolean => {
    const today = new Date().toISOString().split("T")[0];
    if (form.serviceDate > today) {
      setDateError("Service date cannot be in the future");
      return false;
    }
    setDateError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDate()) {
      toast({ title: "Validation Error", description: "Please fix the date error", variant: "destructive" });
      return;
    }
    const asset = assets.find((a) => a.id === form.assetId);
    try {
      const created = await addMaintenanceAPI({
        assetId: form.assetId,
        assetName: asset?.name || "",
        serviceDate: form.serviceDate,
        description: form.description,
      });
      setRecords([created, ...records]);
      setForm({ assetId: "", serviceDate: "", description: "" });
      setDateError(undefined);
      toast({ title: "Success", description: "Maintenance record added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
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
        <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
        <p className="text-muted-foreground text-sm mt-1">Track asset service and repair records</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
        <h2 className="font-semibold text-card-foreground mb-4">Add Maintenance Record</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Select Asset</label>
            <select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose asset</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-card-foreground">Service Date</label>
            <input type="date" value={form.serviceDate} max={new Date().toISOString().split("T")[0]} onChange={(e) => { setForm({ ...form, serviceDate: e.target.value }); setDateError(undefined); }} required className={`w-full px-4 py-2.5 rounded-lg border ${dateError ? 'border-destructive' : 'border-input'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring`} />
            {dateError && <p className="text-xs text-destructive">{dateError}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Service details..." className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Add Record
          </button>
        </form>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Maintenance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Service Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No maintenance records found</td></tr>
              ) : records.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                  <td className="px-5 py-3 font-medium text-card-foreground">{r.assetName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.serviceDate}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
