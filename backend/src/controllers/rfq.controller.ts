import { Request, Response } from "express";
import { rfqService } from "../services/rfq.service";

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

    if (!title || !description || !quantity || !deadline || !createdById) {
      return res.status(400).json({
        success: false,
        message:
          "title, description, quantity, deadline and createdById are required",
      });
    }

    const rfq = await rfqService.create({
      title,
      description,
      quantity: Number(quantity),
      deadline: new Date(deadline),
      createdById,
      assignedVendorId: assignedVendorId ?? null,
      status,
    });

    return res.status(201).json({ success: true, data: rfq });
  } catch (error: any) {
    console.error("createRfq error:", error);
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
