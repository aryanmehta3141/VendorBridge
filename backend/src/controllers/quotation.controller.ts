import { Request, Response } from "express";

export async function createQuotation(_req: Request, res: Response): Promise<void> {
  res.status(201).json({ message: "Create quotation - coming soon" });
}

export async function getQuotationsByRfq(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Get quotations by RFQ - coming soon", data: [] });
}
