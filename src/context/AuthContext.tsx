import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "user";

interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const mockCredentials = [
  { email: "admin@college.edu", password: "admin123", role: "admin" as UserRole, name: "Admin User" },
  { email: "user@college.edu", password: "user123", role: "user" as UserRole, name: "Rahul Kumar" },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string, role: UserRole): boolean => {
    const found = mockCredentials.find(
      (c) => c.email === email && c.password === password && c.role === role
    );
    if (found) {
      setUser({ email: found.email, role: found.role, name: found.name });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
