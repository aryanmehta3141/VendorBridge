import { Request, Response } from "express";
import { rfqService } from "../services/rfq.service";
import { prisma } from "../prisma/prisma";

/**
 * Resolves a valid DB user id to use as createdById.
 * Order of preference:
 *  1. The provided id actually exists in the DB → use it.
 *  2. Find any PROCUREMENT_OFFICER in the DB → use their id.
 *  3. No users at all → upsert a demo PROCUREMENT_OFFICER and return their id.
 */
async function resolveCreatedById(requestedId: string): Promise<string> {
  // 1. Check if the supplied id exists
  const existing = await prisma.user.findUnique({ where: { id: requestedId } });
  if (existing) {
    console.log("[RFQ] createdById resolved from request:", existing.id);
    return existing.id;
  }

  console.warn(
    `[RFQ] createdById "${requestedId}" not found in DB — falling back to demo user`
  );

  // 2. Find any PROCUREMENT_OFFICER
  const officer = await prisma.user.findFirst({
    where: { role: "PROCUREMENT_OFFICER" },
  });
  if (officer) {
    console.log("[RFQ] Using existing PROCUREMENT_OFFICER:", officer.id);
    return officer.id;
  }

  // 3. Upsert demo user
  const demo = await prisma.user.upsert({
    where: { email: "demo@vendorbridge.com" },
    update: {},
    create: {
      name: "Demo Procurement Officer",
      email: "demo@vendorbridge.com",
      role: "PROCUREMENT_OFFICER",
    },
  });
  console.log("[RFQ] Created demo PROCUREMENT_OFFICER:", demo.id);
  return demo.id;
}

export const getRfqs = async (_req: Request, res: Response) => {
  try {
    const rfqs = await rfqService.getAll();
    return res.status(200).json({ success: true, data: rfqs });
  } catch (error: any) {
    console.error("getRfqs error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch RFQs" });
  }
};

export const getRfqById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rfq = await rfqService.getById(id);

    if (!rfq) {
      return res
        .status(404)
        .json({ success: false, message: "RFQ not found" });
    }

    return res.status(200).json({ success: true, data: rfq });
  } catch (error: any) {
    console.error("getRfqById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch RFQ" });
  }
};

export const createRfq = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      quantity,
      deadline,
      createdById,
      assignedVendorId,
      status,
    } = req.body;

    // Detailed request log for debugging
    console.log("[RFQ createRfq] request body:", {
      title,
      description,
      quantity,
      deadline,
      createdById,
      assignedVendorId,
    });

    if (!title || !description || !quantity || !deadline) {
      return res.status(400).json({
        success: false,
        message: "title, description, quantity and deadline are required",
      });
    }

    // Resolve a valid createdById — auto-creates demo user if needed
    const resolvedCreatedById = await resolveCreatedById(createdById ?? "");
    console.log("[RFQ createRfq] resolved createdById:", resolvedCreatedById);

    // Validate assignedVendorId if provided
    if (assignedVendorId) {
      const vendor = await prisma.vendor.findUnique({ where: { id: assignedVendorId } });
      console.log("[RFQ createRfq] assignedVendorId lookup:", assignedVendorId, "→", vendor ? "found" : "NOT FOUND");
      if (!vendor) {
        return res.status(400).json({
          success: false,
          message: "Selected vendor does not exist",
        });
      }
    }

    const rfq = await rfqService.create({
      title,
      description,
      quantity: Number(quantity),
      deadline: new Date(deadline),
      createdById: resolvedCreatedById,
      assignedVendorId: assignedVendorId ?? null,
      status,
    });

    console.log("[RFQ createRfq] created RFQ id:", rfq.id);
    return res.status(201).json({ success: true, data: rfq });
  } catch (error: any) {
    console.error("[RFQ createRfq] error code:", error?.code);
    console.error("[RFQ createRfq] error message:", error?.message);
    console.error("[RFQ createRfq] full error:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid createdById or assignedVendorId reference",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to create RFQ" });
  }
};

export const updateRfq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, quantity, deadline, assignedVendorId } =
      req.body;

    const hasUpdate =
      title !== undefined ||
      description !== undefined ||
      quantity !== undefined ||
      deadline !== undefined ||
      assignedVendorId !== undefined;

    if (!hasUpdate) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);
      if (
        Number.isNaN(parsedQuantity) ||
        parsedQuantity <= 0 ||
        !Number.isInteger(parsedQuantity)
      ) {
        return res.status(400).json({
          success: false,
          message: "quantity must be a positive integer",
        });
      }
    }

    if (deadline !== undefined) {
      const parsedDeadline = new Date(deadline);
      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "deadline must be a valid date",
        });
      }
    }

    const rfq = await rfqService.update(id, {
      title,
      description,
      quantity:
        quantity !== undefined ? Number(quantity) : undefined,
      deadline:
        deadline !== undefined ? new Date(deadline) : undefined,
      assignedVendorId,
    });

    return res.status(200).json({ success: true, data: rfq });
  } catch (error: any) {
    console.error("updateRfq error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "RFQ not found" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid assignedVendorId reference",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to update RFQ" });
  }
};
