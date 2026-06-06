import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/vendors", label: "Vendors" },
  { to: "/rfqs", label: "RFQs" },
  { to: "/vendor-portal", label: "Vendor Portal" },
  { to: "/quotations", label: "Quotations" },
  { to: "/approval", label: "Approval" },
  { to: "/purchase-orders", label: "Purchase Orders" },
  { to: "/invoices", label: "Invoices" },
];

export default function Sidebar() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  }

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
