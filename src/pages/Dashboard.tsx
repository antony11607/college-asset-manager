import { Package, CheckCircle, ArrowRightLeft, Wrench } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { initialAssets, initialAllocations, initialMaintenance } from "@/data/mockData";

export default function Dashboard() {
  const total = initialAssets.length;
  const available = initialAssets.filter((a) => a.status === "Available").length;
  const allocated = initialAssets.filter((a) => a.status === "Allocated").length;
  const maintenance = initialAssets.filter((a) => a.status === "Maintenance").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of college asset inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={total} icon={Package} color="primary" />
        <StatCard title="Available" value={available} icon={CheckCircle} color="success" />
        <StatCard title="Allocated" value={allocated} icon={ArrowRightLeft} color="info" />
        <StatCard title="Under Maintenance" value={maintenance} icon={Wrench} color="warning" />
      </div>

      {/* Recent Allocations */}
      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Recent Allocations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Issue Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {initialAllocations.map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3 text-card-foreground">{a.assetName}</td>
                  <td className="px-5 py-3 text-card-foreground">{a.userName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.issueDate}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.returnDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Maintenance */}
      <div className="bg-card rounded-xl card-shadow-md border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Recent Maintenance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Asset</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Service Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {initialMaintenance.map((m) => (
                <tr key={m.id} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3 text-card-foreground">{m.assetName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.serviceDate}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
