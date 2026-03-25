import { useState, useEffect } from "react";
import { Package, CheckCircle, ArrowRightLeft, Wrench, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Asset, Allocation, MaintenanceRecord, MonthlyActivity, AllocationTrend } from "@/types/index";
import { getAssetsAPI, getAllocationsAPI, getMaintenanceAPI, getMonthlyActivityAPI, getAllocationTrendAPI } from "@/services/api";
import { sampleAssets, sampleAllocations, sampleMaintenance, sampleMonthlyActivity, sampleAllocationTrend } from "@/data/sampleData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 72%, 51%)",
];

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([]);
  const [allocationTrend, setAllocationTrend] = useState<AllocationTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [assetsData, allocData, maintData, activityData, trendData] = await Promise.all([
          getAssetsAPI().catch(() => []),
          getAllocationsAPI().catch(() => []),
          getMaintenanceAPI().catch(() => []),
          getMonthlyActivityAPI().catch(() => []),
          getAllocationTrendAPI().catch(() => []),
        ]);
        setAssets(assetsData.length > 0 ? assetsData : sampleAssets);
        setAllocations(allocData.length > 0 ? allocData : sampleAllocations);
        setMaintenance(maintData.length > 0 ? maintData : sampleMaintenance);
        setMonthlyActivity(activityData.length > 0 ? activityData : sampleMonthlyActivity);
        setAllocationTrend(trendData.length > 0 ? trendData : sampleAllocationTrend);
      } catch {
        setAssets(sampleAssets);
        setAllocations(sampleAllocations);
        setMaintenance(sampleMaintenance);
        setMonthlyActivity(sampleMonthlyActivity);
        setAllocationTrend(sampleAllocationTrend);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const total = assets.length;
  const available = assets.filter((a) => a.status === "Available").length;
  const allocated = assets.filter((a) => a.status === "Allocated").length;
  const maintenanceCount = assets.filter((a) => a.status === "Maintenance").length;

  const statusData = [
    { name: "Available", value: available },
    { name: "Allocated", value: allocated },
    { name: "Maintenance", value: maintenanceCount },
  ];

  const categoryData = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of college asset inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={total} icon={Package} color="primary" />
        <StatCard title="Available" value={available} icon={CheckCircle} color="success" />
        <StatCard title="Allocated" value={allocated} icon={ArrowRightLeft} color="info" />
        <StatCard title="Under Maintenance" value={maintenanceCount} icon={Wrench} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Asset Status Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-primary" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {allocations.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No allocations yet</td></tr>
                ) : allocations.slice(0, 5).map((a) => (
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
                {maintenance.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No maintenance records yet</td></tr>
                ) : maintenance.slice(0, 5).map((m) => (
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
