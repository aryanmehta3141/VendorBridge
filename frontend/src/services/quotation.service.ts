import { get, post } from "@/services/api";
import type { Quotation } from "@/types/quotation";
import type { Vendor } from "@/types/vendor";

export interface QuotationWithVendor extends Quotation {
  vendor: Vendor;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  data: T;
}

export interface CreateQuotationPayload {
  rfqId: string;
  price: number;
  deliveryDays: number;
  comments?: string;
}

export async function createQuotation(
  payload: CreateQuotationPayload
): Promise<QuotationWithVendor> {
  const response = await post<ApiResponse<QuotationWithVendor>>(
    "/quotations",
    payload
  );
  return response.data;
}

export async function getQuotationsByRfq(
  rfqId: string
): Promise<QuotationWithVendor[]> {
  const response = await get<ApiResponse<QuotationWithVendor[]>>(
    `/quotations/${rfqId}`
  );
  return response.data;
}

export async function selectQuotationWinner(
  quotationId: string
): Promise<QuotationWithVendor> {
  const response = await post<ApiResponse<QuotationWithVendor>>(
    `/quotations/${quotationId}/select-winner`
  );
  return response.data;
}
