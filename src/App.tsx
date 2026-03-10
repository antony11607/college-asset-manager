import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import { AdminLayout } from "./components/AdminLayout";
import { UserLayout } from "./components/UserLayout";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Allocation from "./pages/Allocation";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/admin/Reports";
import UserDashboard from "./pages/user/UserDashboard";
import MyAllocations from "./pages/user/MyAllocations";
import RequestAsset from "./pages/user/RequestAsset";
import UserMaintenance from "./pages/user/UserMaintenance";
import Profile from "./pages/user/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/assets" element={<Assets />} />
              <Route path="/admin/allocation" element={<Allocation />} />
              <Route path="/admin/maintenance" element={<Maintenance />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>

            {/* User Routes */}
            <Route element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/allocations" element={<MyAllocations />} />
              <Route path="/user/request" element={<RequestAsset />} />
              <Route path="/user/maintenance" element={<UserMaintenance />} />
              <Route path="/user/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
