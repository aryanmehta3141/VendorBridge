type Request = {
  body: any;
  params: Record<string, any>;
};

type Response = {
  status: (code: number) => Response;
  json: (body: any) => Response;
};

import { vendorService } from "../services/vendor.service";

export const getVendors = async (_req: Request, res: Response) => {
  try {
    const vendors = await vendorService.getAll();
    return res.status(200).json({ success: true, data: vendors });
  } catch (error: any) {
    console.error("getVendors error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch vendors" });
  }
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const { name, email, category, status } = req.body;

    if (!name || !email || !category) {
      return res.status(400).json({
        success: false,
        message: "name, email and category are required",
      });
    }

    const vendor = await vendorService.create({ name, email, category, status });
    return res.status(201).json({ success: true, data: vendor });
  } catch (error: any) {
    console.error("createVendor error:", error);
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Vendor email already exists" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to create vendor" });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, category, status } = req.body;

    const vendor = await vendorService.update(id, {
      name,
      email,
      category,
      status,
    });
    return res.status(200).json({ success: true, data: vendor });
  } catch (error: any) {
    console.error("updateVendor error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Vendor email already exists" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to update vendor" });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await vendorService.remove(id);
    return res
      .status(200)
      .json({ success: true, message: "Vendor deleted successfully" });
  } catch (error: any) {
    console.error("deleteVendor error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete vendor" });
  }
};
