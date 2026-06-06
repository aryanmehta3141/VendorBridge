import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get, post } from "@/services/api";
import type { Quotation } from "@/types/quotation";
import type { Vendor } from "@/types/vendor";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";
import {
  CheckCircle2, XCircle, Clock, Building2,
  Package, Calendar, MessageSquare, AlertCircle,
  IndianRupee, Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RfqSummary { id: string; title: string; description: string; quantity: number; deadline: string; }
interface QuotationWithVendor extends Quotation { vendor: Vendor; rfq?: RfqSummary; }
interface ApiResponse<T> { success?: boolean; data: T; }

export default function Approval() {
  const { role } = useAuth();
  const canAct = role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN;

  const [quotations, setQuotations] = useState<QuotationWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  async function loadPending() {
    setLoading(true); setError(null);
    try {
      const rfqRes = await get<ApiResponse<Array<{ id: string; title: string; description: string; quantity: number; deadline: string }>>>("/rfqs");
      const rfqs = rfqRes.data;
      const allQ: QuotationWithVendor[] = [];
      await Promise.all(rfqs.map(async (rfq) => {
        try {
          const res = await get<ApiResponse<QuotationWithVendor[]>>(`/quotations/${rfq.id}`);
          allQ.push(...res.data.map((q) => ({ ...q, rfq })));
        } catch { /* skip */ }
      }));
      setQuotations(allQ.filter((q) => q.status === "PENDING_APPROVAL"));
    } catch { setError("Failed to load pending approvals."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadPending(); }, []);

  async function handleApprove(id: string) {
    setActingId(id); setError(null);
    try { await post(`/approvals/${id}/approve`); await loadPending(); }
    catch (err: any) { setError(err?.response?.data?.message ?? "Failed to approve."); }
    finally { setActingId(null); }
  }

  async function handleReject(id: string) {
    setActingId(id); setError(null);
    try { await post(`/approvals/${id}/reject`); await loadPending(); }
    catch (err: any) { setError(err?.response?.data?.message ?? "Failed to reject."); }
    finally { setActingId(null); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Manager Approval"
        description="Review and approve pending quotations"
        action={
          !loading && (
            <div className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
              quotations.length > 0
                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            )}>
              <Clock className="h-3 w-3" />
              {quotations.length} pending
            </div>
          )
        }
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {loading && <Loading text="Loading approvals…" />}

      {!loading && quotations.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400/30" />
          <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground/60">No quotations pending approval.</p>
        </div>
      )}

      {!loading && quotations.length > 0 && (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div key={q.id} className="overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-all hover:border-border hover:shadow-xl hover:shadow-black/20">
              {/* RFQ context bar */}
              {q.rfq && (
                <div className="border-b border-border/40 bg-muted/20 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">RFQ</span>
                    <p className="text-sm font-semibold text-foreground">{q.rfq.title}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" />{q.rfq.quantity} units</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(q.rfq.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {q.rfq.description && (
                    <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-1">{q.rfq.description}</p>
                  )}
                </div>
              )}

              {/* Quotation body */}
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Vendor info */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <Building2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{q.vendor?.name ?? q.vendorId}</p>
                      {q.vendor?.email && <p className="text-xs text-muted-foreground">{q.vendor.email}</p>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        {q.price.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Quoted price</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {q.deliveryDays}
                      </div>
                      <p className="text-xs text-muted-foreground">Delivery days</p>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                {q.comments && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2.5 text-sm">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-muted-foreground">{q.comments}</p>
                  </div>
                )}

                {/* Actions */}
                {canAct && (
                  <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-border/40 pt-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Remarks (optional)</label>
                      <input
                        type="text"
                        placeholder="Add your decision remarks…"
                        value={remarks[q.id] ?? ""}
                        onChange={(e) => setRemarks({ ...remarks, [q.id]: e.target.value })}
                        className="w-full rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(q.id)}
                        disabled={actingId === q.id}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-900/30"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {actingId === q.id ? "Processing…" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(q.id)}
                        disabled={actingId === q.id}
                        className="flex items-center gap-2 rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors shadow-lg shadow-red-900/30"
                      >
                        <XCircle className="h-4 w-4" />
                        {actingId === q.id ? "Processing…" : "Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
