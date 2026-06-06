import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ROLE_LABELS,
  USER_ROLES,
  type UserRole,
} from "@/utils/constants";
import { ROLE_HOME } from "@/utils/roleConfig";

const ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.VENDOR,
  USER_ROLES.MANAGER,
];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "Full access to all pages and actions",
  [USER_ROLES.PROCUREMENT_OFFICER]: "Manage vendors, RFQs, quotations, POs and invoices",
  [USER_ROLES.VENDOR]: "View assigned RFQs and submit quotations",
  [USER_ROLES.MANAGER]: "Review and approve/reject quotations",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    navigate(ROLE_HOME[role]);
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
              className="rounded-lg border bg-background px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
            >
              <p className="font-medium">{ROLE_LABELS[role]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          No password required. Role is stored in localStorage.
        </p>
      </div>
    </div>
  );
}
