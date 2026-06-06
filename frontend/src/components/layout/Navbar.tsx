import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/utils/constants";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        <Link to="/dashboard" className="text-lg font-semibold text-primary">
          VendorBridge
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.name} · {ROLE_LABELS[user.role]}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
