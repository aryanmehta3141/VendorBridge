import type { UserRole } from "@/utils/constants";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}
