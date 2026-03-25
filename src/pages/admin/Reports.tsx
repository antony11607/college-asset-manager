import { useState, useEffect } from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { Asset, Allocation, MaintenanceRecord } from "@/types/index";
import { getAssetsAPI, getAllocationsAPI, getMaintenanceAPI } from "@/services/api";
import { sampleAssets, sampleAllocations, sampleMaintenance } from "@/data/sampleData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "@/hooks/use-toast";

const CHART_COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 72%, 51%)",
];

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  toast({ title: "Download Started", description: `${filename} is being downloaded` });
}

export default function Reports() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [a, al, m] = await Promise.all([
          getAssetsAPI().catch(() => []),
          getAllocationsAPI().catch(() => []),
          getMaintenanceAPI().catch(() => []),
        ]);
        setAssets(a.length > 0 ? a : sampleAssets);
        setAllocations(al.length > 0 ? al : sampleAllocations);
        setMaintenance(m.length > 0 ? m : sampleMaintenance);
      } catch {
        setAssets(sampleAssets);
        setAllocations(sampleAllocations);
        setMaintenance(sampleMaintenance);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadAssets = () => {
    downloadCSV("assets_report.csv",
      ["ID", "Name", "Category", "Purchase Date", "Status", "Location", "Quantity"],
      assets.map(a => [a.id, a.name, a.category, a.purchaseDate, a.status, a.location, String(a.quantity || 1)])
    );
  };

  const handleDownloadAllocations = () => {
    downloadCSV("allocations_report.csv",
      ["ID", "Asset", "User", "Issue Date", "Return Date"],
      allocations.map(a => [a.id, a.assetName, a.userName, a.issueDate, a.returnDate])
    );
  };

  const handleDownloadMaintenance = () => {
    downloadCSV("maintenance_report.csv",
      ["ID", "Asset", "Service Date", "Description"],
      maintenance.map(m => [m.id, m.assetName, m.serviceDate, m.description])
    );
  };

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive asset management insights</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleDownloadAssets} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> Assets
          </button>
          <button onClick={handleDownloadAllocations} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> Allocations
          </button>
          <button onClick={handleDownloadMaintenance} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> Maintenance
          </button>
        </div>
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
