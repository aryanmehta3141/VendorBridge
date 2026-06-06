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
}
