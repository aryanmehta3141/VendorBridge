import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

const poInclude = {
  vendor: {
    select: { id: true, name: true, email: true, category: true },
  },
  quotation: {
    select: {
      id: true,
      price: true,
      deliveryDays: true,
      status: true,
      rfqId: true,
      rfq: { select: { id: true, title: true, status: true } },
    },
  },
} as const;

export async function createPurchaseOrder(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { quotationId, vendorId } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: { quotationId, vendorId, status: "PO_CREATED" },
      include: poInclude,
    });

    res.status(201).json({
      message: "Purchase Order created successfully",
      data: purchaseOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create purchase order" });
  }
}

// GET /purchase-orders?vendorId=<id>  — optional filter for vendor-scoped view
export async function getPurchaseOrders(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { vendorId } = req.query;

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: vendorId ? { vendorId: String(vendorId) } : undefined,
      include: poInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: purchaseOrders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch purchase orders" });
  }
}