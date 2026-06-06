import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get, post } from "@/services/api";
import type { Invoice } from "@/types/invoice";
import type { PurchaseOrder } from "@/types/purchaseOrder";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

interface GenerateForm {
  poId: string;
  amount: string;
}

export default function Invoices() {
  const { role } = useAuth();
  const canGenerate = role === USER_ROLES.PROCUREMENT_OFFICER || role === USER_ROLES.ADMIN;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [availablePos, setAvailablePos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GenerateForm>({ poId: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [invRes, poRes] = await Promise.all([
        get<ApiResponse<Invoice[]>>("/invoices"),
        get<ApiResponse<PurchaseOrder[]>>("/purchase-orders"),
      ]);

      setInvoices(invRes.data);

      const invoicedPoIds = new Set(invRes.data.map((inv) => inv.poId));
      const available = poRes.data.filter((po) => !invoicedPoIds.has(po.id));
      setAvailablePos(available);

      if (available.length > 0) {
        setForm((f) => ({ ...f, poId: available[0].id }));
      }
    } catch {
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.poId || !form.amount) return;
    setSubmitting(true);
    setError(null);
    try {
      await post<ApiResponse<Invoice>>("/invoices", {
        poId: form.poId,
        amount: Number(form.amount),
      });
      setForm({ poId: "", amount: "" });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to generate invoice.");
    } finally {
      setSubmitting(false);
    }
  }

  // Label for PO dropdown: show vendor name + RFQ title if available
  function poLabel(po: PurchaseOrder): string {
    const vendor = po.vendor?.name ?? po.vendorId.slice(0, 8) + "…";
    const rfq = po.quotation?.rfq?.title ?? "";
    return rfq ? `${vendor} — ${rfq}` : vendor;
  }

  return (
    <div>
      <PageHeader title="Invoices" description="Generate and view invoices" />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <Loading />}

      {/* Generate form */}
      {!loading && canGenerate && availablePos.length > 0 && (
        <div className="mb-6 rounded-lg border bg-muted/20 p-4">
          <h2 className="mb-3 text-base font-semibold">Generate Invoice</h2>
          <form onSubmit={handleGenerate} className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Purchase Order *</label>
              <select
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.poId}
                onChange={(e) => setForm({ ...form, poId: e.target.value })}
              >
                <option value="">Select PO…</option>
                {availablePos.map((po) => (
                  <option key={po.id} value={po.id}>
                    {poLabel(po)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Amount (₹) *</label>
              <input
                required
                type="number"
                min={1}
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                placeholder="e.g. 50000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {submitting ? "Generating…" : "Generate Invoice"}
              </button>
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">GST (18%) is calculated automatically.</p>
        </div>
      )}

      {!loading && invoices.length === 0 && (!canGenerate || availablePos.length === 0) && (
        <p className="text-muted-foreground">
          {canGenerate ? "No invoices yet. Generate a PO first." : "No invoices yet."}
        </p>
      )}

      {/* Invoice table */}
      {!loading && invoices.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Invoices
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice ID</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">RFQ</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">GST (18%)</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{inv.id.slice(0, 12)}…</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {inv.purchaseOrder?.vendor?.name ?? "—"}
                      </p>
                      {inv.purchaseOrder?.vendor?.email && (
                        <p className="text-xs text-muted-foreground">
                          {inv.purchaseOrder.vendor.email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {inv.purchaseOrder?.quotation?.rfq?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3">₹{inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">₹{inv.tax.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold">₹{inv.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {inv.status}
                      </span>
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
