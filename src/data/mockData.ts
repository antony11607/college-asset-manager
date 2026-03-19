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

export const initialAssets: Asset[] = [
  { id: "AST-001", name: "Dell Latitude 5520", category: "Laptop", purchaseDate: "2024-01-15", status: "Available", location: "Lab A" },
  { id: "AST-002", name: "Epson EB-X51", category: "Projector", purchaseDate: "2023-08-20", status: "Allocated", location: "Room 201" },
  { id: "AST-003", name: "HP LaserJet Pro", category: "Printer", purchaseDate: "2024-03-10", status: "Available", location: "Admin Office" },
  { id: "AST-004", name: "Cisco Catalyst 2960", category: "Network Switch", purchaseDate: "2023-05-12", status: "Maintenance", location: "Server Room" },
  { id: "AST-005", name: "MacBook Air M2", category: "Laptop", purchaseDate: "2024-06-01", status: "Allocated", location: "Lab B" },
  { id: "AST-006", name: "Oscilloscope DSO1102E", category: "Lab Equipment", purchaseDate: "2022-11-08", status: "Available", location: "Electronics Lab" },
  { id: "AST-007", name: "Canon EOS R50", category: "Camera", purchaseDate: "2024-02-28", status: "Available", location: "Media Room" },
  { id: "AST-008", name: "BenQ GW2780", category: "Monitor", purchaseDate: "2023-09-15", status: "Allocated", location: "Lab A" },
];

export const initialAllocations: Allocation[] = [
  { id: "ALC-001", assetId: "AST-002", assetName: "Epson EB-X51", userName: "Dr. Sharma", issueDate: "2025-01-10", returnDate: "2025-03-10" },
  { id: "ALC-002", assetId: "AST-005", assetName: "MacBook Air M2", userName: "Prof. Gupta", issueDate: "2025-01-15", returnDate: "2025-06-15" },
  { id: "ALC-003", assetId: "AST-008", assetName: "BenQ GW2780", userName: "Student - Rahul K.", issueDate: "2025-02-01", returnDate: "2025-04-01" },
];

export const initialMaintenance: MaintenanceRecord[] = [
  { id: "MNT-001", assetId: "AST-004", assetName: "Cisco Catalyst 2960", serviceDate: "2025-02-01", description: "Firmware update and port diagnostics" },
  { id: "MNT-002", assetId: "AST-001", assetName: "Dell Latitude 5520", serviceDate: "2025-01-20", description: "Battery replacement and OS reinstall" },
];

export const users = [
  "Dr. Sharma",
  "Prof. Gupta",
  "Prof. Mehta",
  "Student - Rahul K.",
  "Student - Priya S.",
  "Student - Amit R.",
  "Lab Assistant - Sunil",
];
export interface AssetRequest {
  id: string;
  user_id: string;
  asset_id: string;
  quantity: number;
  status: "pending" | "approved" | "rejected";
}

export const categories = ["Laptop", "Projector", "Printer", "Network Switch", "Lab Equipment", "Camera", "Monitor", "Furniture", "Other"];
