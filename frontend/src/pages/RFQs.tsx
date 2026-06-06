import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get, post, put } from "@/services/api";
import type { Rfq } from "@/types/rfq";
import type { Vendor } from "@/types/vendor";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";
import {
  Plus, X, FileText, Calendar, Package,
  UserCheck, ChevronRight, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiResponse<T> { success: boolean; data: T; }
const EMPTY_FORM = { title: "", description: "", quantity: "", deadline: "" };

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_STYLE[status] ?? "bg-muted text-muted-foreground border-border")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function RFQs() {
  const { user, role } = useAuth();
  const canCreate = role === USER_ROLES.PROCUREMENT_OFFICER || role === USER_ROLES.ADMIN;
  const canAssign = role === USER_ROLES.PROCUREMENT_OFFICER || role === USER_ROLES.ADMIN;

  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignVendorMap, setAssignVendorMap] = useState<Record<string, string>>({});

  async function loadData() {
    setLoading(true); setError(null);
    try {
      const [r, v] = await Promise.all([
        get<ApiResponse<Rfq[]>>("/rfqs"),
        get<ApiResponse<Vendor[]>>("/vendors"),
      ]);
      setRfqs(r.data); setVendors(v.data);
    } catch { setError("Failed to load data."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); if (!user) return;
    setSubmitting(true); setError(null);
    try {
      await post<ApiResponse<Rfq>>("/rfqs", { ...form, quantity: Number(form.quantity), createdById: user.id });
      setShowForm(false); setForm(EMPTY_FORM); await loadData();
    } catch (err: any) { setError(err?.response?.data?.message ?? "Failed to create RFQ."); }
    finally { setSubmitting(false); }
  }

  async function handleAssign(rfqId: string) {
    const vendorId = assignVendorMap[rfqId]; if (!vendorId) return;
    setAssigningId(rfqId); setError(null);
    try {
      await put<ApiResponse<Rfq>>(`/rfqs/${rfqId}`, { assignedVendorId: vendorId });
      await loadData();
    } catch (err: any) { setError(err?.response?.data?.message ?? "Failed to assign vendor."); }
    finally { setAssigningId(null); }
  }

  const activeVendors = vendors.filter((v) => v.status === "ACTIVE");

  const inputCls = "w-full rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-muted/60 transition-colors";

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="RFQ Management"
        description="Create and track Requests for Quotation"
        action={
          canCreate && !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" /> New RFQ
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Create form */}
      {canCreate && showForm && (
        <div className="rounded-xl border border-border/60 bg-card/60 p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Create New RFQ</p>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title *</label>
              <input required className={inputCls} placeholder="e.g. Office Supplies Q3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quantity *</label>
              <input required type="number" min={1} className={inputCls} placeholder="e.g. 500" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description *</label>
              <textarea required rows={2} className={inputCls} placeholder="Describe the procurement requirement…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deadline *</label>
              <input required type="date" className={inputCls} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20">
                {submitting ? "Creating…" : "Create RFQ"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? <Loading /> : rfqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {canCreate ? "No RFQs yet — create your first one above." : "No RFQs available."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rfqs.map((rfq) => {
            const assignedVendor = vendors.find((v) => v.id === rfq.assignedVendorId);
            return (
              <div key={rfq.id} className="group rounded-xl border border-border/60 bg-card/60 p-4 transition-all duration-150 hover:border-border hover:bg-card hover:shadow-lg hover:shadow-black/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <p className="text-sm font-semibold text-foreground truncate">{rfq.title}</p>
                      <StatusBadge status={rfq.status} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{rfq.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {rfq.quantity} units</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(rfq.deadline).toLocaleDateString()}</span>
                      {assignedVendor && (
                        <span className="flex items-center gap-1 text-blue-400"><UserCheck className="h-3 w-3" /> {assignedVendor.name}</span>
                      )}
                    </div>
                  </div>

                  {canAssign && !rfq.assignedVendorId && activeVendors.length > 0 && (
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        className="rounded-lg border border-border/60 bg-muted/60 px-2.5 py-1.5 text-xs text-foreground focus:border-primary/60 transition-colors"
                        value={assignVendorMap[rfq.id] ?? ""}
                        onChange={(e) => setAssignVendorMap({ ...assignVendorMap, [rfq.id]: e.target.value })}
                      >
                        <option value="">Assign vendor…</option>
                        {activeVendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <button
                        disabled={!assignVendorMap[rfq.id] || assigningId === rfq.id}
                        onClick={() => handleAssign(rfq.id)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors"
                      >
                        {assigningId === rfq.id ? "…" : <><ChevronRight className="h-3 w-3" />Assign</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
