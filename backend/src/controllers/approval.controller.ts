import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";


// Approve quotation — also updates RFQ status to APPROVED
export async function approveQuotation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    // Advance the parent RFQ status
    await prisma.rfq.update({
      where: { id: quotation.rfqId },
      data: { status: "APPROVED" },
    });

    res.json({
      message: "Quotation approved successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve quotation" });
  }
}

// Reject quotation — also updates RFQ status to REJECTED
export async function rejectQuotation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    // Advance the parent RFQ status
    await prisma.rfq.update({
      where: { id: quotation.rfqId },
      data: { status: "REJECTED" },
    });

    res.json({
      message: "Quotation rejected successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject quotation" });
  }
}