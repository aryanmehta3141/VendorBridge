import { Request, Response } from "express";

export async function getVendors(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Vendors endpoint - coming soon", data: [] });
}

export async function createVendor(_req: Request, res: Response): Promise<void> {
  res.status(201).json({ message: "Create vendor - coming soon" });
}

export async function updateVendor(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Update vendor - coming soon" });
}

export async function deleteVendor(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Delete vendor - coming soon" });
}
