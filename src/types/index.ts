export interface Asset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  status: "Available" | "Allocated" | "Maintenance";
  location: string;
  quantity?: number;
}

export interface Allocation {
  id: string;
  assetId: string;
  assetName: string;
  userName: string;
  issueDate: string;
  returnDate: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  serviceDate: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface AssetRequest {
  id: string;
  user_id: string;
  asset_id: string;
  quantity: number;
  status: "pending" | "approved" | "rejected";
  userName: string;
  assetName: string;
  requestDate: string;
  reason?: string;
}

export interface DashboardStats {
  totalAssets: number;
  available: number;
  allocated: number;
  maintenance: number;
}

export interface MonthlyActivity {
  month: string;
  added: number;
  removed: number;
  maintenance: number;
}

export interface AllocationTrend {
  month: string;
  allocations: number;
}
