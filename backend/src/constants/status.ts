export const USER_ROLES = {
  ADMIN: "ADMIN",
  PROCUREMENT_OFFICER: "PROCUREMENT_OFFICER",
  VENDOR: "VENDOR",
  MANAGER: "MANAGER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const RFQ_STATUS = {
  RFQ_CREATED: "RFQ_CREATED",
  VENDOR_ASSIGNED: "VENDOR_ASSIGNED",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type RfqStatusValue =
  (typeof RFQ_STATUS)[keyof typeof RFQ_STATUS];

export const QUOTATION_STATUS = {
  QUOTATION_SUBMITTED: "QUOTATION_SUBMITTED",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type QuotationStatusValue =
  (typeof QUOTATION_STATUS)[keyof typeof QUOTATION_STATUS];

export const PO_STATUS = {
  PO_CREATED: "PO_CREATED",
} as const;

export type PoStatusValue = (typeof PO_STATUS)[keyof typeof PO_STATUS];

export const INVOICE_STATUS = {
  INVOICE_CREATED: "INVOICE_CREATED",
} as const;

export type InvoiceStatusValue =
  (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const VENDOR_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type VendorStatusValue =
  (typeof VENDOR_STATUS)[keyof typeof VENDOR_STATUS];
