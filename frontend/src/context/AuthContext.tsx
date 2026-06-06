import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types/user";
import {
  STORAGE_KEYS,
  USER_ROLES,
  type UserRole,
} from "@/utils/constants";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  [USER_ROLES.ADMIN]: {
    id: "1",
    name: "Admin User",
    role: USER_ROLES.ADMIN,
    email: "admin@vendorbridge.com",
  },
  [USER_ROLES.PROCUREMENT_OFFICER]: {
    id: "2",
    name: "Procurement Officer",
    role: USER_ROLES.PROCUREMENT_OFFICER,
    email: "officer@vendorbridge.com",
  },
  [USER_ROLES.VENDOR]: {
    id: "3",
    name: "Vendor User",
    role: USER_ROLES.VENDOR,
    email: "vendor@vendorbridge.com",
  },
  [USER_ROLES.MANAGER]: {
    id: "4",
    name: "Manager User",
    role: USER_ROLES.MANAGER,
    email: "manager@vendorbridge.com",
  },
};

function getStoredRole(): UserRole | null {
  const stored = localStorage.getItem(STORAGE_KEYS.ROLE);
  if (stored && Object.values(USER_ROLES).includes(stored as UserRole)) {
    return stored as UserRole;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => getStoredRole());

  const login = useCallback((selectedRole: UserRole) => {
    localStorage.setItem(STORAGE_KEYS.ROLE, selectedRole);
    setRole(selectedRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    setRole(null);
  }, []);

  const user = role ? DEMO_USERS[role] : null;

  const value = useMemo(
    () => ({
      user,
      role,
      login,
      logout,
      isAuthenticated: !!role,
    }),
    [user, role, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
