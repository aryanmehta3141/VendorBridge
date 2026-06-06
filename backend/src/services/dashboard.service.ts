import { QUOTATION_STATUS } from "../constants/status";
import { prisma } from "../prisma/prisma";

export interface DashboardStats {
  totalVendors: number;
  activeRFQs: number;
  pendingApprovals: number;
  totalInvoices: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [totalVendors, activeRFQs, pendingApprovals, totalInvoices] =
      await Promise.all([
        prisma.vendor.count(),
        prisma.rfq.count(),
        prisma.quotation.count({
          where: { status: QUOTATION_STATUS.PENDING_APPROVAL },
        }),
        prisma.invoice.count(),
      ]);

    return {
      totalVendors,
      activeRFQs,
      pendingApprovals,
      totalInvoices,
    };
  },
};
