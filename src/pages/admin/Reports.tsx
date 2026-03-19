import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Asset, Allocation, MaintenanceRecord } from "@/types/index";
import { getAssetsAPI, getAllocationsAPI, getMaintenanceAPI } from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 72%, 51%)",
];

export default function Reports() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [a, al, m] = await Promise.all([getAssetsAPI(), getAllocationsAPI(), getMaintenanceAPI()]);
        setAssets(a);
        setAllocations(al);
        setMaintenance(m);
      } catch (error) {
        console.error("Reports fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusData = [
    { name: "Available", value: assets.filter((a) => a.status === "Available").length },
    { name: "Allocated", value: assets.filter((a) => a.status === "Allocated").length },
    { name: "Maintenance", value: assets.filter((a) => a.status === "Maintenance").length },
  ];

  const categoryData = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const locationData = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.location] = (acc[a.location] || 0) + 1;
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
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Comprehensive asset management insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5 text-center">
          <p className="text-3xl font-bold text-primary">{assets.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Assets</p>
        </div>
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5 text-center">
          <p className="text-3xl font-bold text-primary">{allocations.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Active Allocations</p>
        </div>
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5 text-center">
          <p className="text-3xl font-bold text-primary">{maintenance.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Maintenance Records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Assets by Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 50%)" }} width={110} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Bar dataKey="value" fill={CHART_COLORS[0]} name="Count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Assets by Location</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Bar dataKey="value" fill={CHART_COLORS[3]} name="Assets" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
