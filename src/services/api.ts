// API Service for Asset Management System
// Update API_BASE with your actual PHP backend URL
const API_BASE = "http://localhost/backend";

import type { Asset, Allocation, MaintenanceRecord, AssetRequest, DashboardStats, MonthlyActivity, AllocationTrend } from "@/types/index";

// ─── Assets ───────────────────────────────────────────
export const getAssetsAPI = async (): Promise<Asset[]> => {
  const res = await fetch(`${API_BASE}/get_assets.php`);
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
};

export const addAssetAPI = async (asset: Omit<Asset, "id">): Promise<Asset> => {
  const res = await fetch(`${API_BASE}/add_asset.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  });
  if (!res.ok) throw new Error("Failed to add asset");
  return res.json();
};

export const updateAssetAPI = async (asset: Asset): Promise<Asset> => {
  const res = await fetch(`${API_BASE}/update_asset.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  });
  if (!res.ok) throw new Error("Failed to update asset");
  return res.json();
};

export const deleteAssetAPI = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/delete_asset.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete asset");
};

// ─── Allocations ──────────────────────────────────────
export const getAllocationsAPI = async (userId?: string): Promise<Allocation[]> => {
  const params = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/get_allocations.php${params}`);
  if (!res.ok) throw new Error("Failed to fetch allocations");
  return res.json();
};

export const addAllocationAPI = async (allocation: Omit<Allocation, "id">): Promise<Allocation> => {
  const res = await fetch(`${API_BASE}/add_allocation.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(allocation),
  });
  if (!res.ok) throw new Error("Failed to add allocation");
  return res.json();
};

// ─── Maintenance ──────────────────────────────────────
export const getMaintenanceAPI = async (userId?: string): Promise<MaintenanceRecord[]> => {
  const params = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/get_maintenance.php${params}`);
  if (!res.ok) throw new Error("Failed to fetch maintenance records");
  return res.json();
};

export const addMaintenanceAPI = async (record: Omit<MaintenanceRecord, "id">): Promise<MaintenanceRecord> => {
  const res = await fetch(`${API_BASE}/add_maintenance.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error("Failed to add maintenance record");
  return res.json();
};

// ─── Asset Requests ───────────────────────────────────
export interface RequestAssetPayload {
  user_id: string;
  asset_id: string;
  quantity: number;
  reason?: string;
}

export const requestAssetAPI = async (payload: RequestAssetPayload): Promise<AssetRequest> => {
  const res = await fetch(`${API_BASE}/request_asset.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create request");
  return res.json();
};

export const getRequestsAPI = async (userId?: string): Promise<AssetRequest[]> => {
  const params = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/get_requests.php${params}`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
};

export const approveRequestAPI = async (payload: { request_id: string }): Promise<void> => {
  const res = await fetch(`${API_BASE}/approve_request.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to approve request");
};

export const rejectRequestAPI = async (payload: { request_id: string }): Promise<void> => {
  const res = await fetch(`${API_BASE}/reject_request.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to reject request");
};

// ─── Dashboard ────────────────────────────────────────
export const getDashboardStatsAPI = async (): Promise<DashboardStats> => {
  const res = await fetch(`${API_BASE}/get_dashboard_stats.php`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

export const getMonthlyActivityAPI = async (): Promise<MonthlyActivity[]> => {
  const res = await fetch(`${API_BASE}/get_monthly_activity.php`);
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
};

export const getAllocationTrendAPI = async (): Promise<AllocationTrend[]> => {
  const res = await fetch(`${API_BASE}/get_allocation_trend.php`);
  if (!res.ok) throw new Error("Failed to fetch trend");
  return res.json();
};

// ─── Users ────────────────────────────────────────────
export const getUsersAPI = async (): Promise<{ id: string; name: string }[]> => {
  const res = await fetch(`${API_BASE}/get_users.php`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};
