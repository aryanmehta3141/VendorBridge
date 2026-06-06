export async function getAllRfqs(): Promise<never[]> {
  return [];
}

export async function createRfqRecord(_data: unknown): Promise<{ message: string }> {
  return { message: "RFQ service - coming soon" };
}

export async function getRfqRecord(_id: string): Promise<{ message: string }> {
  return { message: "RFQ service - coming soon" };
}
