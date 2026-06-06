import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/utils/constants";
import { ROLE_HOME } from "@/utils/roleConfig";
import { Building2, Shield, Briefcase, Store, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.VENDOR,
  USER_ROLES.MANAGER,
];

const ROLE_META: Record<UserRole, { description: string; icon: React.ElementType; color: string; dot: string }> = {
  [USER_ROLES.ADMIN]: {
    description: "Full system access — manage all modules",
    icon: Shield,
    color: "hover:border-violet-500/50 hover:bg-violet-500/5 group-hover:text-violet-400",
    dot: "bg-violet-500",
  },
  [USER_ROLES.PROCUREMENT_OFFICER]: {
    description: "Create RFQs, compare quotations, generate POs & invoices",
    icon: Briefcase,
    color: "hover:border-blue-500/50 hover:bg-blue-500/5 group-hover:text-blue-400",
    dot: "bg-blue-500",
  },
  [USER_ROLES.VENDOR]: {
    description: "View assigned RFQs and submit competitive quotations",
    icon: Store,
    color: "hover:border-emerald-500/50 hover:bg-emerald-500/5 group-hover:text-emerald-400",
    dot: "bg-emerald-500",
  },
  [USER_ROLES.MANAGER]: {
    description: "Review pending approvals and make procurement decisions",
    icon: CheckCircle,
    color: "hover:border-amber-500/50 hover:bg-amber-500/5 group-hover:text-amber-400",
    dot: "bg-amber-500",
  },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    navigate(ROLE_HOME[role]);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-[300px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">VendorBridge</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enterprise Procurement Platform
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Hackathon Demo Mode
          </div>
        </div>

        {/* Role cards */}
        <div className="space-y-2">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Select your role to continue
          </p>
          {ROLES.map((role) => {
            const meta = ROLE_META[role];
            const Icon = meta.icon;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={cn(
                  "group w-full rounded-xl border border-border/60 bg-card/60 p-4 text-left transition-all duration-200",
                  "hover:shadow-lg hover:shadow-black/20",
                  meta.color
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 transition-colors group-hover:bg-muted">
                      <Icon className="h-4.5 w-4.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ROLE_LABELS[role]}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/40">
          No authentication required · Role persisted in localStorage
        </p>
      </div>
    </div>
  );
}
