import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ROLE_LABELS,
  USER_ROLES,
  type UserRole,
} from "@/utils/constants";

const ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.VENDOR,
  USER_ROLES.MANAGER,
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">VendorBridge</h1>
          <p className="mt-2 text-muted-foreground">
            Select a role to continue (Hackathon Mode)
          </p>
        </div>
        <div className="grid gap-3">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className="rounded-lg border bg-background px-4 py-3 text-left font-medium transition hover:border-primary hover:bg-primary/5"
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          No password required. Role is stored in localStorage.
        </p>
        <Link
          to="/dashboard"
          className="mt-4 block text-center text-sm text-primary hover:underline"
        >
          Skip to Dashboard
        </Link>
      </div>
    </div>
  );
}
