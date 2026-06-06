import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const data = await dashboardService.getStats();
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    console.error("getDashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
