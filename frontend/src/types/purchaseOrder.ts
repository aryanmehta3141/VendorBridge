import type { PO_STATUS } from "@/utils/constants";

export type PurchaseOrderStatus =
  (typeof PO_STATUS)[keyof typeof PO_STATUS];

export interface PurchaseOrder {
  id: string;
  quotationId: string;
  vendorId: string;
  status: PurchaseOrderStatus;
  createdAt?: string;
  // Populated when backend includes relations
  vendor?: {
    id: string;
    name: string;
    email: string;
    category?: string;
  };
  quotation?: {
    id: string;
    price: number;
    deliveryDays: number;
    status: string;
    rfqId?: string;
    rfq?: {
      id: string;
      title: string;
      status: string;
    };
  };
}
