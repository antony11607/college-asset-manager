import { initialAssets, initialAllocations, initialMaintenance } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from "recharts";

const CHART_COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 72%, 51%)",
];

const statusData = [
  { name: "Available", value: initialAssets.filter((a) => a.status === "Available").length },
  { name: "Allocated", value: initialAssets.filter((a) => a.status === "Allocated").length },
  { name: "Maintenance", value: initialAssets.filter((a) => a.status === "Maintenance").length },
];

const categoryData = Object.entries(
  initialAssets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));

const locationData = Object.entries(
  initialAssets.reduce<Record<string, number>>((acc, a) => {
    acc[a.location] = (acc[a.location] || 0) + 1;
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));

const monthlyTrend = [
  { month: "Sep", assets: 4, allocations: 2, maintenance: 0 },
  { month: "Oct", assets: 5, allocations: 1, maintenance: 1 },
  { month: "Nov", assets: 6, allocations: 3, maintenance: 0 },
  { month: "Dec", assets: 6, allocations: 2, maintenance: 1 },
  { month: "Jan", assets: 8, allocations: 4, maintenance: 2 },
  { month: "Feb", assets: 8, allocations: 3, maintenance: 1 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Comprehensive asset management insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5 text-center">
          <p className="text-3xl font-bold text-primary">{initialAssets.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Assets</p>
        </div>
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5 text-center">
          <p className="text-3xl font-bold text-primary">{initialAllocations.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Active Allocations</p>
        </div>
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5 text-center">
          <p className="text-3xl font-bold text-primary">{initialMaintenance.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Maintenance Records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie */}
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

        {/* Category Bar */}
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

        {/* Monthly Trend */}
        <div className="bg-card rounded-xl card-shadow-md border border-border/50 p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Line type="monotone" dataKey="assets" stroke={CHART_COLORS[0]} strokeWidth={2} name="Total Assets" />
              <Line type="monotone" dataKey="allocations" stroke={CHART_COLORS[1]} strokeWidth={2} name="Allocations" />
              <Line type="monotone" dataKey="maintenance" stroke={CHART_COLORS[2]} strokeWidth={2} name="Maintenance" />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Location Distribution */}
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
