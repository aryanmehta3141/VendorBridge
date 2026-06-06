import { Request, Response } from "express";
import { USER_ROLES, type UserRole } from "../constants/status";
import {
  QuotationError,
  createQuotationRecord,
  getQuotationsForRfq,
  resolveVendorIdForRfq,
  selectQuotationWinner,
} from "../services/quotation.service";

function handleError(error: unknown, res: Response): void {
  if (error instanceof QuotationError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}

function parseCreateBody(body: unknown): {
  rfqId: string;
  price: number;
  deliveryDays: number;
  comments?: string;
} | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { rfqId, price, deliveryDays, comments } = body as Record<string, unknown>;

  if (typeof rfqId !== "string" || !rfqId.trim()) {
    return null;
  }

  const parsedPrice = Number(price);
  const parsedDeliveryDays = Number(deliveryDays);

  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return null;
  }

  if (!Number.isInteger(parsedDeliveryDays) || parsedDeliveryDays <= 0) {
    return null;
  }

  return {
    rfqId: rfqId.trim(),
    price: parsedPrice,
    deliveryDays: parsedDeliveryDays,
    comments: typeof comments === "string" ? comments.trim() || undefined : undefined,
  };
}

export async function createQuotation(req: Request, res: Response): Promise<void> {
  try {
    if (req.user?.role !== USER_ROLES.VENDOR) {
      res.status(403).json({ message: "Only vendors can submit quotations" });
      return;
    }

    const payload = parseCreateBody(req.body);
    if (!payload) {
      res.status(400).json({
        message: "Invalid request body. Required: rfqId, price (>0), deliveryDays (positive integer)",
      });
      return;
    }

    const vendorId = await resolveVendorIdForRfq(payload.rfqId);
    if (!vendorId) {
      res.status(403).json({ message: "No vendor assigned to this RFQ" });
      return;
    }

    const quotation = await createQuotationRecord(payload, vendorId);
    res.status(201).json({ data: quotation });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getQuotationsByRfq(req: Request, res: Response): Promise<void> {
  try {
    const { rfqId } = req.params;
    if (!rfqId) {
      res.status(400).json({ message: "RFQ id is required" });
      return;
    }

    const quotations = await getQuotationsForRfq(rfqId);
    res.json({ data: quotations });
  } catch (error) {
    handleError(error, res);
  }
}

export async function selectWinner(req: Request, res: Response): Promise<void> {
  try {
    const allowedRoles: UserRole[] = [
      USER_ROLES.PROCUREMENT_OFFICER,
      USER_ROLES.ADMIN,
    ];
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Only procurement officers can select a winner" });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Quotation id is required" });
      return;
    }

    const quotation = await selectQuotationWinner(id);
    res.json({ data: quotation });
  } catch (error) {
    handleError(error, res);
  }
}
