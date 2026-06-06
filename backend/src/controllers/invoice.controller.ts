import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

const invoiceInclude = {
  purchaseOrder: {
    select: {
      id: true,
      status: true,
      vendorId: true,
      vendor: { select: { id: true, name: true, email: true } },
      quotation: {
        select: {
          id: true,
          price: true,
          deliveryDays: true,
          rfq: { select: { id: true, title: true } },
        },
      },
    },
  },
} as const;

export async function createInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { poId, amount } = req.body;

    const tax = amount * 0.18;
    const total = amount + tax;

    const invoice = await prisma.invoice.create({
      data: { poId, amount, tax, total, status: "INVOICE_CREATED" },
      include: invoiceInclude,
    });

    res.status(201).json({ message: "Invoice created successfully", data: invoice });
  } catch (error) {
    res.status(500).json({ message: "Failed to create invoice" });
  }
}

export async function getInvoices(_req: Request, res: Response): Promise<void> {
  try {
    const invoices = await prisma.invoice.findMany({
      include: invoiceInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: invoices });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
}