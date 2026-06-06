import type { UserRole } from "../constants/status";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        name?: string;
        email?: string;
      };
    }
  }
}

export {};
