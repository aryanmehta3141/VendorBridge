import { USER_ROLES, type UserRole } from "@/utils/constants";

/** Routes each role is allowed to visit */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  [USER_ROLES.ADMIN]: [
    "/dashboard",
    "/vendors",
    "/rfqs",
    "/vendor-portal",
    "/quotations",
    "/approval",
    "/purchase-orders",
    "/invoices",
  ],
  [USER_ROLES.PROCUREMENT_OFFICER]: [
    "/dashboard",
    "/vendors",
    "/rfqs",
    "/quotations",
    "/purchase-orders",
    "/invoices",
  ],
  [USER_ROLES.VENDOR]: ["/vendor-portal"],
  [USER_ROLES.MANAGER]: ["/dashboard", "/approval"],
};

/** Sidebar nav items visible per role */
export const ROLE_NAV: Record<UserRole, { to: string; label: string }[]> = {
  [USER_ROLES.ADMIN]: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/vendors", label: "Vendors" },
    { to: "/rfqs", label: "RFQs" },
    { to: "/vendor-portal", label: "Vendor Portal" },
    { to: "/quotations", label: "Quotations" },
    { to: "/approval", label: "Approval" },
    { to: "/purchase-orders", label: "Purchase Orders" },
    { to: "/invoices", label: "Invoices" },
  ],
  [USER_ROLES.PROCUREMENT_OFFICER]: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/vendors", label: "Vendors" },
    { to: "/rfqs", label: "RFQs" },
    { to: "/quotations", label: "Quotations" },
    { to: "/purchase-orders", label: "Purchase Orders" },
    { to: "/invoices", label: "Invoices" },
  ],
  [USER_ROLES.VENDOR]: [{ to: "/vendor-portal", label: "Vendor Portal" }],
  [USER_ROLES.MANAGER]: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/approval", label: "Approval" },
  ],
};

/** Default landing page after login per role */
export const ROLE_HOME: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "/dashboard",
  [USER_ROLES.PROCUREMENT_OFFICER]: "/dashboard",
  [USER_ROLES.VENDOR]: "/vendor-portal",
  [USER_ROLES.MANAGER]: "/dashboard",
};

export function canAccess(role: UserRole | null, path: string): boolean {
  if (!role) return false;
  return ROLE_ROUTES[role].includes(path);
}
