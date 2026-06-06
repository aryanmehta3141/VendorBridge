import { RFQ_STATUS } from "../constants/status";
import { prisma } from "../prisma/prisma";
import type { RfqStatus } from "@prisma/client";

const rfqInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  assignedVendor: {
    select: {
      id: true,
      name: true,
      email: true,
      category: true,
      status: true,
    },
  },
};

export const rfqService = {
  async getAll() {
    return prisma.rfq.findMany({
      include: rfqInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.rfq.findUnique({
      where: { id },
      include: rfqInclude,
    });
  },

  async create(data: {
    title: string;
    description: string;
    quantity: number;
    deadline: Date;
    createdById: string;
    assignedVendorId?: string | null;
    status?: RfqStatus;
  }) {
    return prisma.rfq.create({
      data: {
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        deadline: data.deadline,
        createdById: data.createdById,
        assignedVendorId: data.assignedVendorId ?? null,
        status:
          data.status ??
          (data.assignedVendorId
            ? RFQ_STATUS.VENDOR_ASSIGNED
            : RFQ_STATUS.RFQ_CREATED),
      },
      include: rfqInclude,
    });
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      quantity?: number;
      deadline?: Date;
      assignedVendorId?: string | null;
    }
  ) {
    const updateData: {
      title?: string;
      description?: string;
      quantity?: number;
      deadline?: Date;
      assignedVendorId?: string | null;
      status?: RfqStatus;
    } = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
    }
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline;
    }
    if (data.assignedVendorId) {
      updateData.assignedVendorId = data.assignedVendorId;
      updateData.status = RFQ_STATUS.VENDOR_ASSIGNED;
    }

    return prisma.rfq.update({
      where: { id },
      data: updateData,
      include: rfqInclude,
    });
  },
};
