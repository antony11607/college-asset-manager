import { Package, CheckCircle, ArrowRightLeft, Wrench, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { initialAssets, initialAllocations, initialMaintenance } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 50%)",   // primary blue
  "hsl(142, 71%, 45%)",   // success green
  "hsl(38, 92%, 50%)",    // warning orange
  "hsl(199, 89%, 48%)",   // info cyan
  "hsl(0, 72%, 51%)",     // destructive red
];

// Category distribution
const categoryData = Object.entries(
  initialAssets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));

// Status distribution for pie chart
const statusData = [
  { name: "Available", value: initialAssets.filter((a) => a.status === "Available").length },
  { name: "Allocated", value: initialAssets.filter((a) => a.status === "Allocated").length },
  { name: "Maintenance", value: initialAssets.filter((a) => a.status === "Maintenance").length },
];

// Monthly asset activity (mock trend data)
const monthlyActivity = [
  { month: "Sep", added: 1, removed: 0, maintenance: 0 },
  { month: "Oct", added: 0, removed: 0, maintenance: 1 },
  { month: "Nov", added: 2, removed: 1, maintenance: 0 },
  { month: "Dec", added: 0, removed: 0, maintenance: 1 },
  { month: "Jan", added: 3, removed: 1, maintenance: 2 },
  { month: "Feb", added: 1, removed: 0, maintenance: 1 },
];

// Allocation trend
const allocationTrend = [
  { month: "Sep", allocations: 2 },
  { month: "Oct", allocations: 1 },
  { month: "Nov", allocations: 3 },
  { month: "Dec", allocations: 2 },
  { month: "Jan", allocations: 4 },
  { month: "Feb", allocations: 3 },
];

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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Added vs Removed */}
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-card-foreground">Assets Added vs Removed</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyActivity} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Bar dataKey="added" fill={CHART_COLORS[0]} name="Added" radius={[4, 4, 0, 0]} />
              <Bar dataKey="removed" fill={CHART_COLORS[4]} name="Removed" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Status Pie */}
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Asset Status Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Assets by Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 50%)" }} width={110} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Bar dataKey="value" fill={CHART_COLORS[3]} name="Count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Trend */}
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-info" />
            <h2 className="font-semibold text-card-foreground">Allocation Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={allocationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Area type="monotone" dataKey="allocations" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.15} strokeWidth={2} name="Allocations" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                </tr>
              </thead>
              <tbody>
                {initialAllocations.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-3 text-card-foreground">{a.assetName}</td>
                    <td className="px-5 py-3 text-card-foreground">{a.userName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.issueDate}</td>
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
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
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
    </div>
  );
}
