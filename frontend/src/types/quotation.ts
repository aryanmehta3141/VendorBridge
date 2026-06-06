import type { QUOTATION_STATUS } from "@/utils/constants";

export type QuotationStatus =
  (typeof QUOTATION_STATUS)[keyof typeof QUOTATION_STATUS];

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  price: number;
  deliveryDays: number;
  comments?: string;
  status: QuotationStatus;
}
