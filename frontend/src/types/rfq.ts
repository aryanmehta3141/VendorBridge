import type { RFQ_STATUS } from "@/utils/constants";

export type RfqStatus = (typeof RFQ_STATUS)[keyof typeof RFQ_STATUS];

export interface Rfq {
  id: string;
  title: string;
  description: string;
  quantity: number;
  deadline: string;
  status: RfqStatus;
  assignedVendorId?: string;
  createdById?: string;
}
