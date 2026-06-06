import { Request, Response } from "express";

export async function createInvoice(_req: Request, res: Response): Promise<void> {
  res.status(201).json({ message: "Create invoice - coming soon" });
}

export async function getInvoices(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Invoices endpoint - coming soon", data: [] });
}
