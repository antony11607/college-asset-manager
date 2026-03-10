import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, ChevronDown } from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const roles: { label: string; value: UserRole }[] = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
];

export default function Login() {
  const [role, setRole] = useState<UserRole | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ title: "Error", description: "Please select a role", variant: "destructive" });
      return;
    }
    const success = login(email, password, role);
    if (success) {
      navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } else {
      toast({ title: "Login Failed", description: "Invalid credentials. Try admin@college.edu / admin123 or user@college.edu / user123", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Asset Management System</h1>
          <p className="text-muted-foreground mt-1">Sign in to manage college assets</p>
        </div>

        <div className="bg-card rounded-2xl card-shadow-lg border border-border/50 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span className={role ? "text-foreground" : "text-muted-foreground"}>
                    {role ? roles.find(r => r.value === role)?.label : "Select your role"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {roleOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg card-shadow-md overflow-hidden">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setRole(r.value); setRoleOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors text-card-foreground"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <div className="mt-5 p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">Admin: admin@college.edu / admin123</p>
            <p className="text-xs text-muted-foreground">User: user@college.edu / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
