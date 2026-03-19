import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Allocation as AllocationType, Asset } from "@/types/index";
import { getAllocationsAPI, addAllocationAPI, getAssetsAPI, getUsersAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function Allocation() {
  const [allocations, setAllocations] = useState<AllocationType[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ assetId: "", userName: "", issueDate: "", returnDate: "" });
  const [errors, setErrors] = useState<{ issueDate?: string; returnDate?: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocData, assetData, userData] = await Promise.all([
          getAllocationsAPI(),
          getAssetsAPI(),
          getUsersAPI(),
        ]);
        setAllocations(allocData);
        setAssets(assetData);
        setUsers(userData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableAssets = assets.filter((a) => a.status === "Available");

  const validateDates = (): boolean => {
    const newErrors: { issueDate?: string; returnDate?: string } = {};
    const today = new Date().toISOString().split("T")[0];
    if (form.issueDate && form.issueDate < today) newErrors.issueDate = "Issue date cannot be in the past";
    if (form.returnDate && form.issueDate && form.returnDate <= form.issueDate) newErrors.returnDate = "Return date must be after issue date";
    if (form.returnDate && form.returnDate < today) newErrors.returnDate = "Return date cannot be in the past";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) {
      toast({ title: "Validation Error", description: "Please fix the date errors", variant: "destructive" });
      return;
    }
    const asset = assets.find((a) => a.id === form.assetId);
    try {
      const created = await addAllocationAPI({
        assetId: form.assetId,
        assetName: asset?.name || "",
        userName: form.userName,
        issueDate: form.issueDate,
        returnDate: form.returnDate,
      });
      setAllocations([created, ...allocations]);
      setForm({ assetId: "", userName: "", issueDate: "", returnDate: "" });
      setErrors({});
      toast({ title: "Success", description: "Asset allocated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to allocate asset", variant: "destructive" });
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
        <h1 className="text-2xl font-bold text-foreground">Allocation</h1>
        <p className="text-muted-foreground text-sm mt-1">Assign assets to staff and students</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
        <h2 className="font-semibold text-card-foreground mb-4">Allocate Asset</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Select Asset</label>
            <select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose asset</option>
              {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Select User</label>
            <select value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose user</option>
              {users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-card-foreground">Issue Date</label>
            <input type="date" value={form.issueDate} onChange={(e) => { setForm({ ...form, issueDate: e.target.value }); setErrors((prev) => ({ ...prev, issueDate: undefined })); }} required className={`w-full px-4 py-2.5 rounded-lg border ${errors.issueDate ? 'border-destructive' : 'border-input'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring`} />
            {errors.issueDate && <p className="text-xs text-destructive">{errors.issueDate}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-card-foreground">Return Date</label>
            <input type="date" value={form.returnDate} min={form.issueDate || undefined} onChange={(e) => { setForm({ ...form, returnDate: e.target.value }); setErrors((prev) => ({ ...prev, returnDate: undefined })); }} required className={`w-full px-4 py-2.5 rounded-lg border ${errors.returnDate ? 'border-destructive' : 'border-input'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring`} />
            {errors.returnDate && <p className="text-xs text-destructive">{errors.returnDate}</p>}
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Allocate
          </button>
        </form>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Current Allocations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Issue Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No allocations found</td></tr>
              ) : allocations.map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                  <td className="px-5 py-3 font-medium text-card-foreground">{a.assetName}</td>
                  <td className="px-5 py-3 text-card-foreground">{a.userName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.issueDate}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.returnDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
