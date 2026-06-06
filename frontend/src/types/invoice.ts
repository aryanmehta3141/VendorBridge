import type { INVOICE_STATUS } from "@/utils/constants";

export type InvoiceStatus =
  (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export interface Invoice {
  id: string;
  poId: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  createdAt?: string;
  // Populated when backend includes relations
  purchaseOrder?: {
    id: string;
    status: string;
    vendorId: string;
    vendor?: { id: string; name: string; email: string };
    quotation?: {
      id: string;
      price: number;
      deliveryDays: number;
      rfq?: { id: string; title: string };
    };
  };
}
