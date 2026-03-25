import type { Asset, Allocation, MaintenanceRecord, MonthlyActivity, AllocationTrend } from "@/types/index";

export const sampleAssets: Asset[] = [
  { id: "AST-001", name: "Dell Laptop", category: "Laptops", purchaseDate: "2024-01-15", status: "Available", location: "Lab A", quantity: 5 },
  { id: "AST-002", name: "Epson Projector", category: "Projectors", purchaseDate: "2024-02-10", status: "Allocated", location: "Room 101", quantity: 2 },
  { id: "AST-003", name: "Oscilloscope", category: "Lab Equipment", purchaseDate: "2023-11-20", status: "Maintenance", location: "Lab B", quantity: 3 },
  { id: "AST-004", name: "HP Printer", category: "Printers", purchaseDate: "2024-03-05", status: "Available", location: "Office", quantity: 1 },
  { id: "AST-005", name: "MacBook Pro", category: "Laptops", purchaseDate: "2024-04-18", status: "Allocated", location: "Lab A", quantity: 4 },
  { id: "AST-006", name: "BenQ Projector", category: "Projectors", purchaseDate: "2024-05-22", status: "Available", location: "Room 202", quantity: 2 },
  { id: "AST-007", name: "Multimeter", category: "Lab Equipment", purchaseDate: "2023-09-14", status: "Available", location: "Lab C", quantity: 8 },
  { id: "AST-008", name: "Arduino Kit", category: "Lab Equipment", purchaseDate: "2024-06-01", status: "Allocated", location: "Lab B", quantity: 10 },
  { id: "AST-009", name: "Canon Scanner", category: "Printers", purchaseDate: "2024-01-30", status: "Maintenance", location: "Office", quantity: 1 },
  { id: "AST-010", name: "Lenovo Desktop", category: "Desktops", purchaseDate: "2024-07-12", status: "Available", location: "Lab A", quantity: 6 },
];

export const sampleAllocations: Allocation[] = [
  { id: "ALC-001", assetId: "AST-002", assetName: "Epson Projector", userName: "Dr. Smith", issueDate: "2024-08-01", returnDate: "2024-12-31" },
  { id: "ALC-002", assetId: "AST-005", assetName: "MacBook Pro", userName: "Prof. Johnson", issueDate: "2024-09-15", returnDate: "2025-03-15" },
  { id: "ALC-003", assetId: "AST-008", assetName: "Arduino Kit", userName: "Lab Assistant Raj", issueDate: "2024-10-01", returnDate: "2025-02-01" },
];

export const sampleMaintenance: MaintenanceRecord[] = [
  { id: "MNT-001", assetId: "AST-003", assetName: "Oscilloscope", serviceDate: "2024-11-10", description: "Calibration and firmware update" },
  { id: "MNT-002", assetId: "AST-009", assetName: "Canon Scanner", serviceDate: "2024-11-25", description: "Paper feed mechanism repair" },
];

export const sampleMonthlyActivity: MonthlyActivity[] = [
  { month: "Jan", added: 5, removed: 1, maintenance: 2 },
  { month: "Feb", added: 3, removed: 0, maintenance: 1 },
  { month: "Mar", added: 4, removed: 2, maintenance: 3 },
  { month: "Apr", added: 6, removed: 1, maintenance: 1 },
  { month: "May", added: 2, removed: 0, maintenance: 2 },
  { month: "Jun", added: 7, removed: 3, maintenance: 4 },
];

export const sampleAllocationTrend: AllocationTrend[] = [
  { month: "Jan", allocations: 8 },
  { month: "Feb", allocations: 12 },
  { month: "Mar", allocations: 10 },
  { month: "Apr", allocations: 15 },
  { month: "May", allocations: 18 },
  { month: "Jun", allocations: 14 },
];
