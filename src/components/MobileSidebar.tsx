import { LayoutDashboard, Package, ArrowRightLeft, Wrench, LogOut, GraduationCap, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Assets", path: "/assets", icon: Package },
  { title: "Allocation", path: "/allocation", icon: ArrowRightLeft },
  { title: "Maintenance", path: "/maintenance", icon: Wrench },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-accent">
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary">
                  <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-sidebar-accent-foreground">Asset Manager</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </NavLink>
              ))}
            </nav>

            <div className="px-3 pb-4">
              <button
                onClick={() => { navigate("/"); setOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
