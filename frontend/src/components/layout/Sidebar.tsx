import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLE_NAV } from "@/utils/roleConfig";
import {
  LayoutDashboard,
  Users,
  FileText,
  Store,
  BarChart3,
  CheckSquare,
  ShoppingCart,
  Receipt,
} from "lucide-react";

const ROUTE_ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/vendors": Users,
  "/rfqs": FileText,
  "/vendor-portal": Store,
  "/quotations": BarChart3,
  "/approval": CheckSquare,
  "/purchase-orders": ShoppingCart,
  "/invoices": Receipt,
};

export default function Sidebar() {
  const location = useLocation();
  const { role } = useAuth();

  if (location.pathname === "/login") return null;

  const navItems = role ? ROLE_NAV[role] : [];

  return (
    <aside className="w-[220px] shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm">
      <nav className="flex flex-col gap-0.5 p-3 pt-4">
        {navItems.map((item) => {
          const Icon = ROUTE_ICONS[item.to] ?? LayoutDashboard;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom version tag */}
      <div className="absolute bottom-4 left-0 w-[220px] px-4">
        <p className="text-xs text-muted-foreground/40">v1.0 · Hackathon Edition</p>
      </div>
    </aside>
  );
}
