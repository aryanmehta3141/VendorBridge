import { Request, Response } from "express";

export async function approveQuotation(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Approve quotation - coming soon" });
}

export async function rejectQuotation(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Reject quotation - coming soon" });
}
