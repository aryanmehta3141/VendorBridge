import type { VENDOR_STATUS } from "@/utils/constants";

export type VendorStatus = (typeof VENDOR_STATUS)[keyof typeof VENDOR_STATUS];

export interface Vendor {
  id: string;
  name: string;
  email: string;
  category: string;
  status: VendorStatus;
}
