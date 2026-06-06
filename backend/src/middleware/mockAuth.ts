import { Request, Response, NextFunction } from "express";
import { USER_ROLES, UserRole } from "../constants/status";

const VALID_ROLES = Object.values(USER_ROLES);

function parseRole(value: string | undefined): UserRole {
  if (value && VALID_ROLES.includes(value as UserRole)) {
    return value as UserRole;
  }
  return USER_ROLES.ADMIN;
}

export function mockAuth(req: Request, _res: Response, next: NextFunction): void {
  const roleHeader = req.headers["x-user-role"];
  const role =
    typeof roleHeader === "string"
      ? parseRole(roleHeader)
      : USER_ROLES.PROCUREMENT_OFFICER;

  req.user = {
    id: "1",
    role,
    name: "Demo User",
    email: "demo@vendorbridge.com",
  };

  next();
}
