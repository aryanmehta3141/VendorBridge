export async function createQuotationRecord(_data: unknown): Promise<{ message: string }> {
  return { message: "Quotation service - coming soon" };
}

export async function getQuotationsForRfq(_rfqId: string): Promise<never[]> {
  return [];
}
