import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import QuotationForm from "@/components/quotation/QuotationForm";
import { Button } from "@/components/ui/button";
import { get } from "@/services/api";
import type { Rfq } from "@/types/rfq";
import type { Quotation } from "@/types/quotation";
import type { PurchaseOrder } from "@/types/purchaseOrder";
import { USER_ROLES, QUOTATION_STATUS } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RfqSummary {
  id: string;
  title: string;
  description: string;
  status: string;
  quantity: number;
  deadline: string;
}

interface QuotationWithRfq extends Quotation {
  rfq: RfqSummary;
  vendor?: { id: string; name: string; email: string };
}

interface PoVendor {
  id: string;
  name: string;
  email: string;
  category: string;
}

interface PoQuotation {
  id: string;
  price: number;
  deliveryDays: number;
  status: string;
  rfqId: string;
  rfq: { id: string; title: string; status: string };
}

interface VendorPO extends PurchaseOrder {
  vendor?: PoVendor;
  quotation?: PoQuotation;
}

interface ApiListResponse<T> {
  data: T[];
}

// ─── Status badge helpers ────────────────────────────────────────────────────

const QUOTATION_STATUS_LABELS: Record<string, string> = {
  [QUOTATION_STATUS.QUOTATION_SUBMITTED]: "Submitted",
  [QUOTATION_STATUS.PENDING_APPROVAL]: "Pending Approval",
  [QUOTATION_STATUS.APPROVED]: "Approved",
  [QUOTATION_STATUS.REJECTED]: "Rejected",
};

const QUOTATION_STATUS_COLORS: Record<string, string> = {
  [QUOTATION_STATUS.QUOTATION_SUBMITTED]: "bg-blue-100 text-blue-700",
  [QUOTATION_STATUS.PENDING_APPROVAL]: "bg-yellow-100 text-yellow-700",
  [QUOTATION_STATUS.APPROVED]: "bg-green-100 text-green-700",
  [QUOTATION_STATUS.REJECTED]: "bg-red-100 text-red-700",
};

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = "rfqs" | "quotations" | "pos";

const TABS: { id: Tab; label: string }[] = [
  { id: "rfqs", label: "Assigned RFQs" },
  { id: "quotations", label: "My Quotations" },
  { id: "pos", label: "Purchase Orders" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function VendorPortal() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("rfqs");

  // RFQ state
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [rfqLoading, setRfqLoading] = useState(true);
  const [rfqError, setRfqError] = useState<string | null>(null);
  const [activeRfqId, setActiveRfqId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quotation state
  const [quotations, setQuotations] = useState<QuotationWithRfq[]>([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotationError, setQuotationError] = useState<string | null>(null);

  // PO state
  const [pos, setPos] = useState<VendorPO[]>([]);
  const [poLoading, setPoLoading] = useState(false);
  const [poError, setPoError] = useState<string | null>(null);

  // The DB vendor id — derived from assigned RFQs
  const [dbVendorId, setDbVendorId] = useState<string | null>(null);

  // ── Load assigned RFQs ──────────────────────────────────────────────────

  const loadRfqs = useCallback(async () => {
    setRfqLoading(true);
    setRfqError(null);
    try {
      const response = await get<ApiListResponse<Rfq>>("/rfqs");
      const assigned = response.data.filter((rfq) => rfq.assignedVendorId);
      setRfqs(assigned);

      // Derive the DB vendor id from the first assigned RFQ
      if (assigned.length > 0 && assigned[0].assignedVendorId) {
        setDbVendorId(assigned[0].assignedVendorId);
      }
    } catch {
      setRfqError("Failed to load assigned RFQs.");
    } finally {
      setRfqLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRfqs();
  }, [loadRfqs]);

  // ── Load quotations for this vendor ────────────────────────────────────

  const loadQuotations = useCallback(async (vendorId: string) => {
    setQuotationLoading(true);
    setQuotationError(null);
    try {
      const response = await get<ApiListResponse<QuotationWithRfq>>(
        `/quotations/vendor/${vendorId}`
      );
      setQuotations(response.data);
    } catch {
      setQuotationError("Failed to load quotations.");
    } finally {
      setQuotationLoading(false);
    }
  }, []);

  // ── Load POs for this vendor ────────────────────────────────────────────

  const loadPos = useCallback(async (vendorId: string) => {
    setPoLoading(true);
    setPoError(null);
    try {
      const response = await get<ApiListResponse<VendorPO>>(
        `/purchase-orders?vendorId=${vendorId}`
      );
      setPos(response.data);
    } catch {
      setPoError("Failed to load purchase orders.");
    } finally {
      setPoLoading(false);
    }
  }, []);

  // ── Trigger data load when tab changes + vendor id is known ────────────

  useEffect(() => {
    if (!dbVendorId) return;
    if (activeTab === "quotations") loadQuotations(dbVendorId);
    if (activeTab === "pos") loadPos(dbVendorId);
  }, [activeTab, dbVendorId, loadQuotations, loadPos]);

  // ── Quotation submit callback ───────────────────────────────────────────

  const handleQuotationSuccess = () => {
    setActiveRfqId(null);
    setSuccessMessage("Quotation submitted successfully.");
    loadRfqs();
    // Refresh quotations tab data too
    if (dbVendorId) loadQuotations(dbVendorId);
  };

  // ── Non-vendor fallback ────────────────────────────────────────────────

  if (role !== USER_ROLES.VENDOR) {
    return (
      <div>
        <PageHeader title="Vendor Portal" description="Assigned RFQs and quotations" />
        <p className="text-muted-foreground">
          Log in as a Vendor to view assigned RFQs and submit quotations.
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader title="Vendor Portal" description="Assigned RFQs and quotations" />

      {successMessage && (
        <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          {successMessage}
        </p>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setSuccessMessage(null); setActiveTab(tab.id); }}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Assigned RFQs ── */}
      {activeTab === "rfqs" && (
        <>
          {rfqLoading && <Loading />}
          {rfqError && <p className="text-sm text-red-600">{rfqError}</p>}
          {!rfqLoading && !rfqError && rfqs.length === 0 && (
            <p className="text-muted-foreground">No RFQs assigned to you yet.</p>
          )}
          {!rfqLoading && !rfqError && rfqs.length > 0 && (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold">{rfq.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{rfq.description}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Qty: {rfq.quantity}</span>
                        <span>Deadline: {new Date(rfq.deadline).toLocaleDateString()}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-medium ${
                            rfq.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : rfq.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {rfq.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    {/* Only show Submit button if no quotation sent yet for this RFQ */}
                    {activeRfqId !== rfq.id &&
                      rfq.status === "VENDOR_ASSIGNED" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSuccessMessage(null);
                            setActiveRfqId(rfq.id);
                          }}
                        >
                          Submit Quotation
                        </Button>
                      )}
                    {activeRfqId !== rfq.id &&
                      rfq.status !== "VENDOR_ASSIGNED" && (
                        <span className="text-xs text-muted-foreground">
                          {rfq.status === "QUOTATION_RECEIVED"
                            ? "Quotation submitted"
                            : rfq.status.replace(/_/g, " ")}
                        </span>
                      )}
                  </div>

                  {activeRfqId === rfq.id && (
                    <QuotationForm
                      rfqId={rfq.id}
                      onSuccess={handleQuotationSuccess}
                      onCancel={() => setActiveRfqId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab: My Quotations ── */}
      {activeTab === "quotations" && (
        <>
          {quotationLoading && <Loading />}
          {quotationError && <p className="text-sm text-red-600">{quotationError}</p>}
          {!quotationLoading && !dbVendorId && (
            <p className="text-muted-foreground">
              No RFQs have been assigned to you yet — quotations will appear here once you submit one.
            </p>
          )}
          {!quotationLoading && dbVendorId && quotations.length === 0 && (
            <p className="text-muted-foreground">You have not submitted any quotations yet.</p>
          )}
          {!quotationLoading && quotations.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">RFQ</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Delivery Days</th>
                    <th className="px-4 py-3 font-medium">Comments</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.id} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="font-medium">{q.rfq?.title ?? q.rfqId}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.rfq?.status?.replace(/_/g, " ") ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">₹{q.price.toLocaleString()}</td>
                      <td className="px-4 py-3">{q.deliveryDays} days</td>
                      <td className="px-4 py-3 text-muted-foreground">{q.comments ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            QUOTATION_STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {QUOTATION_STATUS_LABELS[q.status] ?? q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Purchase Orders ── */}
      {activeTab === "pos" && (
        <>
          {poLoading && <Loading />}
          {poError && <p className="text-sm text-red-600">{poError}</p>}
          {!poLoading && !dbVendorId && (
            <p className="text-muted-foreground">
              No RFQs have been assigned to you yet — purchase orders will appear here once they are generated.
            </p>
          )}
          {!poLoading && dbVendorId && pos.length === 0 && (
            <p className="text-muted-foreground">No purchase orders issued to you yet.</p>
          )}
          {!poLoading && pos.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">PO Number</th>
                    <th className="px-4 py-3 font-medium">RFQ</th>
                    <th className="px-4 py-3 font-medium">RFQ Status</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Delivery Days</th>
                    <th className="px-4 py-3 font-medium">PO Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.map((po) => (
                    <tr key={po.id} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs">{po.id.slice(0, 14)}…</td>
                      <td className="px-4 py-3 font-medium">
                        {po.quotation?.rfq?.title ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {po.quotation?.rfq?.status ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {po.quotation.rfq.status.replace(/_/g, " ")}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {po.quotation ? `₹${po.quotation.price.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {po.quotation ? `${po.quotation.deliveryDays} days` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
