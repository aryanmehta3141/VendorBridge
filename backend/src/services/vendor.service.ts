import { VENDOR_STATUS } from "../constants/status";
import { prisma } from "../prisma/prisma";
import type { VendorStatus } from "@prisma/client";

export const vendorService = {
  async getAll() {
    return prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: {
    name: string;
    email: string;
    category: string;
    status?: VendorStatus;
  }) {
    return prisma.vendor.create({
      data: {
        name: data.name,
        email: data.email,
        category: data.category,
        status: data.status ?? VENDOR_STATUS.ACTIVE,
      },
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      category?: string;
      status?: VendorStatus;
    }
  ) {
    return prisma.vendor.update({
      where: { id },
      data,
    });
  },

  async remove(id: string) {
    return prisma.vendor.delete({
      where: { id },
    });
  },
};
