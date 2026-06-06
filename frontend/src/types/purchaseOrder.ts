import type { PO_STATUS } from "@/utils/constants";

export type PurchaseOrderStatus =
  (typeof PO_STATUS)[keyof typeof PO_STATUS];

export interface PurchaseOrder {
  id: string;
  quotationId: string;
  vendorId: string;
  status: PurchaseOrderStatus;
  createdAt?: string;
}
