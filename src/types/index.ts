export interface Asset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  status: "Available" | "Allocated" | "Maintenance";
  location: string;
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
  userName?: string; // Optional for display purposes
  assetName?: string; // Optional for display purposes
  requestDate?: string; // Optional for display purposes
  reason?: string; // Optional for display purposes
}