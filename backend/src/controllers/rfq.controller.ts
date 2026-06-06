import { Request, Response } from "express";

export async function getRfqs(_req: Request, res: Response): Promise<void> {
  res.json({ message: "RFQs endpoint - coming soon", data: [] });
}

export async function createRfq(_req: Request, res: Response): Promise<void> {
  res.status(201).json({ message: "Create RFQ - coming soon" });
}

export async function getRfqById(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Get RFQ by ID - coming soon" });
}
