import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/utils/constants";
import { LogOut, Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  PROCUREMENT_OFFICER: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  VENDOR: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  MANAGER: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/login") return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleClass = user ? (ROLE_COLORS[user.role] ?? "bg-muted text-muted-foreground") : "";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-5">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30 group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            VendorBridge
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">— Procurement ERP</span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-foreground leading-none">{user.name}</p>
              </div>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", roleClass)}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-border hover:text-foreground transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
