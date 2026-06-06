import { Request, Response } from "express";

export async function createPurchaseOrder(_req: Request, res: Response): Promise<void> {
  res.status(201).json({ message: "Create purchase order - coming soon" });
}

export async function getPurchaseOrders(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Purchase orders endpoint - coming soon", data: [] });
}
