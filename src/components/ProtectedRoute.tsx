import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

export function ProtectedRoute({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <>{children}</>;
}
