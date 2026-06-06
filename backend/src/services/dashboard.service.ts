export interface DashboardStats {
  totalVendors: number;
  activeRFQs: number;
  pendingApprovals: number;
  invoices: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    totalVendors: 10,
    activeRFQs: 5,
    pendingApprovals: 3,
    invoices: 12,
  };
}
