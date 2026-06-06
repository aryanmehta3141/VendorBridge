import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get, post } from "@/services/api";
import type { Quotation } from "@/types/quotation";
import type { Vendor } from "@/types/vendor";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";

interface RfqSummary {
  id: string;
  title: string;
  description: string;
  quantity: number;
  deadline: string;
}

interface QuotationWithVendor extends Quotation {
  vendor: Vendor;
  rfq?: RfqSummary;
}

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export default function Approval() {
  const { role } = useAuth();
  const canAct = role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN;

  const [quotations, setQuotations] = useState<QuotationWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  async function loadPending() {
    setLoading(true);
    setError(null);
    try {
      const rfqRes = await get<ApiResponse<Array<{ id: string; title: string; description: string; quantity: number; deadline: string }>>>("/rfqs");
      const rfqs = rfqRes.data;

      const allQuotations: QuotationWithVendor[] = [];
      await Promise.all(
        rfqs.map(async (rfq) => {
          try {
            const res = await get<ApiResponse<QuotationWithVendor[]>>(`/quotations/${rfq.id}`);
            // Attach rfq info to each quotation for display
            const withRfq = res.data.map((q) => ({ ...q, rfq }));
            allQuotations.push(...withRfq);
          } catch {
            // ignore
          }
        })
      );

      setQuotations(allQuotations.filter((q) => q.status === "PENDING_APPROVAL"));
    } catch {
      setError("Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleApprove(id: string) {
    setActingId(id);
    setError(null);
    try {
      await post(`/approvals/${id}/approve`);
      await loadPending();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to approve.");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    setActingId(id);
    setError(null);
    try {
      await post(`/approvals/${id}/reject`);
      await loadPending();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to reject.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Manager Approval" description="Review and approve quotations" />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <Loading />}

      {!loading && quotations.length === 0 && (
        <p className="text-muted-foreground">No quotations pending approval.</p>
      )}

      {!loading && quotations.length > 0 && (
        <div className="mt-4 space-y-4">
          {quotations.map((q) => (
            <div key={q.id} className="rounded-lg border p-5 shadow-sm">
              {/* RFQ context */}
              {q.rfq && (
                <div className="mb-3 rounded-md bg-muted/30 px-3 py-2 text-sm">
                  <p className="font-semibold">{q.rfq.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{q.rfq.description}</p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>Qty: {q.rfq.quantity}</span>
                    <span>Deadline: {new Date(q.rfq.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {/* Quotation details */}
              <h2 className="text-base font-semibold">
                Vendor: {q.vendor?.name ?? q.vendorId}
              </h2>
              {q.vendor?.email && (
                <p className="text-xs text-muted-foreground">{q.vendor.email}</p>
              )}
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Amount: ₹{q.price.toLocaleString()}</p>
                <p>Delivery: {q.deliveryDays} days</p>
                {q.comments && <p>Comments: {q.comments}</p>}
                <p>
                  Status:{" "}
                  <span className="font-medium text-yellow-600">
                    Pending Approval
                  </span>
                </p>
              </div>

              {canAct && (
                <>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Remarks (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Add a remark…"
                      value={remarks[q.id] ?? ""}
                      onChange={(e) =>
                        setRemarks({ ...remarks, [q.id]: e.target.value })
                      }
                      className="w-full max-w-sm rounded border bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleApprove(q.id)}
                      disabled={actingId === q.id}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {actingId === q.id ? "Processing…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(q.id)}
                      disabled={actingId === q.id}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {actingId === q.id ? "Processing…" : "Reject"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
