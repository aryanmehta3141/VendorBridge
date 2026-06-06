export async function getAllVendors(): Promise<never[]> {
  return [];
}

export async function createVendorRecord(_data: unknown): Promise<{ message: string }> {
  return { message: "Vendor service - coming soon" };
}

export async function updateVendorRecord(_id: string, _data: unknown): Promise<{ message: string }> {
  return { message: "Vendor service - coming soon" };
}

export async function deleteVendorRecord(_id: string): Promise<{ message: string }> {
  return { message: "Vendor service - coming soon" };
}
