import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import QuotationTable from "@/components/quotation/QuotationTable";
import { get } from "@/services/api";
import {
  getQuotationsByRfq,
  selectQuotationWinner,
  type QuotationWithVendor,
} from "@/services/quotation.service";
import type { Rfq } from "@/types/rfq";
import { USER_ROLES } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, ChevronDown, AlertCircle, Package, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface RfqListResponse { data: Rfq[]; }

const STATUS_STYLE: Record<string, string> = {
  RFQ_CREATED:       "bg-slate-500/10 text-slate-400 border-slate-500/20",
  VENDOR_ASSIGNED:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  QUOTATION_RECEIVED:"bg-violet-500/10 text-violet-400 border-violet-500/20",
  WINNER_SELECTED:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  PENDING_APPROVAL:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPROVED:          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED:          "bg-red-500/10 text-red-400 border-red-500/20",
  PO_CREATED:        "bg-teal-500/10 text-teal-400 border-teal-500/20",
  INVOICE_CREATED:   "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function Quotations() {
  const { role } = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState("");
  const [quotations, setQuotations] = useState<QuotationWithVendor[]>([]);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const canSelectWinner = role === USER_ROLES.PROCUREMENT_OFFICER || role === USER_ROLES.ADMIN;

  useEffect(() => {
    async function loadRfqs() {
      setLoadingRfqs(true); setError(null);
      try {
        const response = await get<RfqListResponse>("/rfqs");
        setRfqs(response.data);
        if (response.data.length > 0) setSelectedRfqId(response.data[0].id);
      } catch { setError("Failed to load RFQs."); }
      finally { setLoadingRfqs(false); }
    }
    loadRfqs();
  }, []);

  const loadQuotations = useCallback(async (rfqId: string) => {
    if (!rfqId) { setQuotations([]); return; }
    setLoadingQuotations(true); setError(null);
    try { setQuotations(await getQuotationsByRfq(rfqId)); }
    catch { setError("Failed to load quotations."); setQuotations([]); }
    finally { setLoadingQuotations(false); }
  }, []);

  useEffect(() => { if (selectedRfqId) loadQuotations(selectedRfqId); }, [selectedRfqId, loadQuotations]);

  const handleSelectWinner = async (quotationId: string) => {
    setSelectingId(quotationId); setError(null);
    try { await selectQuotationWinner(quotationId); await loadQuotations(selectedRfqId); }
    catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to select winner.");
    } finally { setSelectingId(null); }
  };

  const selectedRfq = rfqs.find((r) => r.id === selectedRfqId);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Quotation Comparison" description="Compare vendor quotations and select the best offer" />

      {loadingRfqs && <Loading />}

      {!loadingRfqs && rfqs.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-16 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No RFQs available. Create and assign RFQs first.</p>
        </div>
      )}

      {!loadingRfqs && rfqs.length > 0 && (
        <div className="space-y-5">
          {/* RFQ selector */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Select RFQ</label>
            <div className="relative max-w-md">
              <select
                value={selectedRfqId}
                onChange={(e) => setSelectedRfqId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border/60 bg-muted/40 py-2.5 pl-3 pr-9 text-sm text-foreground focus:border-primary/60 transition-colors"
              >
                {rfqs.map((rfq) => (
                  <option key={rfq.id} value={rfq.id}>{rfq.title}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Selected RFQ meta */}
            {selectedRfq && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {selectedRfq.quantity} units</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(selectedRfq.deadline).toLocaleDateString()}</span>
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 font-medium", STATUS_STYLE[selectedRfq.status] ?? "bg-muted text-muted-foreground border-border")}>
                  {selectedRfq.status.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {selectedRfq?.description && (
              <p className="mt-1.5 text-xs text-muted-foreground/70">{selectedRfq.description}</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {loadingQuotations ? (
            <Loading text="Loading quotations…" />
          ) : (
            <QuotationTable
              quotations={quotations}
              canSelectWinner={canSelectWinner}
              selectingId={selectingId}
              onSelectWinner={handleSelectWinner}
            />
          )}
        </div>
      )}
    </div>
  );
}
