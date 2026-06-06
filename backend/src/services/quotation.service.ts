import { QuotationStatus, RfqStatus } from "@prisma/client";
import { prisma } from "../prisma/prisma";

const vendorInclude = {
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
      category: true,
      status: true,
    },
  },
} as const;

export interface CreateQuotationInput {
  rfqId: string;
  price: number;
  deliveryDays: number;
  comments?: string;
}

export class QuotationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "QuotationError";
    this.statusCode = statusCode;
  }
}

export async function createQuotationRecord(
  data: CreateQuotationInput,
  vendorId: string
) {
  const rfq = await prisma.rfq.findUnique({ where: { id: data.rfqId } });
  if (!rfq) {
    throw new QuotationError("RFQ not found", 404);
  }

  if (!rfq.assignedVendorId || rfq.assignedVendorId !== vendorId) {
    throw new QuotationError("Vendor is not assigned to this RFQ", 403);
  }

  const existing = await prisma.quotation.findFirst({
    where: { rfqId: data.rfqId, vendorId },
  });
  if (existing) {
    throw new QuotationError("Quotation already submitted for this RFQ", 409);
  }

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.create({
      data: {
        rfqId: data.rfqId,
        vendorId,
        price: data.price,
        deliveryDays: data.deliveryDays,
        comments: data.comments ?? null,
        status: QuotationStatus.QUOTATION_SUBMITTED,
      },
      include: vendorInclude,
    });

    await tx.rfq.update({
      where: { id: data.rfqId },
      data: { status: RfqStatus.QUOTATION_RECEIVED },
    });

    return quotation;
  });
}

export async function getQuotationsForRfq(rfqId: string) {
  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq) {
    throw new QuotationError("RFQ not found", 404);
  }

  return prisma.quotation.findMany({
    where: { rfqId },
    include: vendorInclude,
    orderBy: [{ price: "asc" }, { deliveryDays: "asc" }],
  });
}

export async function getQuotationsForVendor(vendorId: string) {
  return prisma.quotation.findMany({
    where: { vendorId },
    include: {
      vendor: {
        select: { id: true, name: true, email: true, category: true, status: true },
      },
      rfq: {
        select: { id: true, title: true, description: true, status: true, deadline: true, quantity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function selectQuotationWinner(quotationId: string) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
  });
  if (!quotation) {
    throw new QuotationError("Quotation not found", 404);
  }

  if (quotation.status === QuotationStatus.REJECTED) {
    throw new QuotationError("Cannot select a rejected quotation", 400);
  }

  if (quotation.status === QuotationStatus.PENDING_APPROVAL) {
    throw new QuotationError("Quotation is already selected as winner", 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.quotation.updateMany({
      where: {
        rfqId: quotation.rfqId,
        id: { not: quotationId },
      },
      data: { status: QuotationStatus.REJECTED },
    });

    const updated = await tx.quotation.update({
      where: { id: quotationId },
      data: { status: QuotationStatus.PENDING_APPROVAL },
      include: vendorInclude,
    });

    await tx.rfq.update({
      where: { id: quotation.rfqId },
      data: { status: RfqStatus.WINNER_SELECTED },
    });

    return updated;
  });
}

export async function resolveVendorIdForRfq(rfqId: string): Promise<string | null> {
  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    select: { assignedVendorId: true },
  });
  return rfq?.assignedVendorId ?? null;
}
