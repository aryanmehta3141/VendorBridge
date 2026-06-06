import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get, post } from "@/services/api";
import type { PurchaseOrder } from "@/types/purchaseOrder";
import type { Quotation } from "@/types/quotation";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

interface QuotationWithVendor extends Quotation {
  vendor?: { id: string; name: string };
  rfq?: { id: string; title: string };
}

export default function PurchaseOrders() {
  const { role } = useAuth();
  const canGenerate = role === USER_ROLES.PROCUREMENT_OFFICER || role === USER_ROLES.ADMIN;

  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [approvedQuotations, setApprovedQuotations] = useState<QuotationWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [poRes, rfqRes] = await Promise.all([
        get<ApiResponse<PurchaseOrder[]>>("/purchase-orders"),
        get<ApiResponse<Array<{ id: string }>>>("/rfqs"),
      ]);

      setPos(poRes.data);

      const rfqIds = rfqRes.data.map((r) => r.id);
      const allQuotations: QuotationWithVendor[] = [];
      await Promise.all(
        rfqIds.map(async (rfqId) => {
          try {
            const res = await get<ApiResponse<QuotationWithVendor[]>>(`/quotations/${rfqId}`);
            allQuotations.push(...res.data);
          } catch {
            // ignore
          }
        })
      );

      const existingQuotationIds = new Set(poRes.data.map((p) => p.quotationId));
      setApprovedQuotations(
        allQuotations.filter(
          (q) => q.status === "APPROVED" && !existingQuotationIds.has(q.id)
        )
      );
    } catch {
      setError("Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function generatePO(quotation: QuotationWithVendor) {
    setGenerating(quotation.id);
    setError(null);
    try {
      await post<ApiResponse<PurchaseOrder>>("/purchase-orders", {
        quotationId: quotation.id,
        vendorId: quotation.vendorId,
      });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to generate PO.");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div>
      <PageHeader title="Purchase Orders" description="Generate and view purchase orders" />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <Loading />}

      {/* Ready-to-generate section */}
      {!loading && canGenerate && approvedQuotations.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Approved Quotations — Ready for PO
          </h2>
          <div className="space-y-3">
            {approvedQuotations.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="text-sm">
                  <p className="font-medium">{q.vendor?.name ?? q.vendorId}</p>
                  <p className="text-muted-foreground">
                    ₹{q.price.toLocaleString()} · {q.deliveryDays} days
                    {q.rfq ? ` · ${q.rfq.title}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => generatePO(q)}
                  disabled={generating === q.id}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {generating === q.id ? "Generating…" : "Generate PO"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && pos.length === 0 && (!canGenerate || approvedQuotations.length === 0) && (
        <p className="text-muted-foreground">
          {canGenerate
            ? "No purchase orders yet. Approve a quotation first."
            : "No purchase orders yet."}
        </p>
      )}

      {/* PO table */}
      {!loading && pos.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Purchase Orders
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">PO ID</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">RFQ</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Delivery</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => (
                  <tr key={po.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{po.id.slice(0, 12)}…</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{po.vendor?.name ?? po.vendorId.slice(0, 8) + "…"}</p>
                      {po.vendor?.email && (
                        <p className="text-xs text-muted-foreground">{po.vendor.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {po.quotation?.rfq?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {po.quotation ? `₹${po.quotation.price.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {po.quotation ? `${po.quotation.deliveryDays} days` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
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
        </div>
      )}
    </div>
  );
}
