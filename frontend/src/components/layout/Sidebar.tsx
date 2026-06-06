import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLE_NAV } from "@/utils/roleConfig";

export default function Sidebar() {
  const location = useLocation();
  const { role } = useAuth();

  if (location.pathname === "/login") {
    return null;
  }

  const navItems = role ? ROLE_NAV[role] : [];

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/20">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
