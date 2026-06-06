import { prisma } from "../prisma/prisma";

export const RfqStatus = {
  RFQ_CREATED: "RFQ_CREATED",
  VENDOR_ASSIGNED: "VENDOR_ASSIGNED",
} as const;

export type RfqStatus = (typeof RfqStatus)[keyof typeof RfqStatus];

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
            ? RfqStatus.VENDOR_ASSIGNED
            : RfqStatus.RFQ_CREATED),
      },
      include: rfqInclude,
    });
  },
};
