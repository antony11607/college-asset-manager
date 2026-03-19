import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Allocation } from "@/types/index";
import { getAllocationsAPI } from "@/services/api";

export default function MyAllocations() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const data = await getAllocationsAPI(user?.email);
        setAllocations(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAllocations();
  }, [user]);

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
        <h1 className="text-2xl font-bold text-foreground">My Allocations</h1>
        <p className="text-muted-foreground text-sm mt-1">Assets currently assigned to you</p>
      </div>

      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Issue Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No allocations found</td></tr>
              ) : allocations.map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                  <td className="px-5 py-3 font-medium text-card-foreground">{a.assetName}</td>
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
