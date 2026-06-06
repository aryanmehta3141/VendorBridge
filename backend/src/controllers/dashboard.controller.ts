import { Request, Response } from "express";
import { getDashboardStats } from "../services/dashboard.service";

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const stats = await getDashboardStats();
  res.json(stats);
}
