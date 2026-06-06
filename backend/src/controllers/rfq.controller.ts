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
