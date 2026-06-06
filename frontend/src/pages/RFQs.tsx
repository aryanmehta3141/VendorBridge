import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get, post, put } from "@/services/api";
import type { Rfq } from "@/types/rfq";
import type { Vendor } from "@/types/vendor";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  quantity: "",
  deadline: "",
};

export default function RFQs() {
  const { user, role } = useAuth();
  // Only PROCUREMENT_OFFICER can create RFQs and assign vendors; ADMIN can view
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
    setLoading(true);
    setError(null);
    try {
      const [rfqRes, vendorRes] = await Promise.all([
        get<ApiResponse<Rfq[]>>("/rfqs"),
        get<ApiResponse<Vendor[]>>("/vendors"),
      ]);
      setRfqs(rfqRes.data);
      setVendors(vendorRes.data);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function cancelForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  async function handleCreateRfq(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await post<ApiResponse<Rfq>>("/rfqs", {
        title: form.title,
        description: form.description,
        quantity: Number(form.quantity),
        deadline: form.deadline,
        createdById: user.id,
      });
      cancelForm();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create RFQ.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignVendor(rfqId: string) {
    const vendorId = assignVendorMap[rfqId];
    if (!vendorId) return;
    setAssigningId(rfqId);
    setError(null);
    try {
      await put<ApiResponse<Rfq>>(`/rfqs/${rfqId}`, { assignedVendorId: vendorId });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to assign vendor.");
    } finally {
      setAssigningId(null);
    }
  }

  const activeVendors = vendors.filter((v) => v.status === "ACTIVE");

  return (
    <div>
      <PageHeader title="RFQs" description="Request for Quotation management" />

      <div className="mb-4 flex items-center justify-between">
        {canCreate && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Create RFQ
          </button>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {canCreate && showForm && (
        <div className="mb-6 rounded-lg border bg-muted/20 p-4">
          <h2 className="mb-3 text-base font-semibold">New RFQ</h2>
          <form onSubmit={handleCreateRfq} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <input
                required
                type="number"
                min={1}
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                required
                rows={2}
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline *</label>
              <input
                required
                type="date"
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create RFQ"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="rounded border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : rfqs.length === 0 ? (
        <p className="text-muted-foreground">
          {canCreate ? "No RFQs yet. Create one above." : "No RFQs available."}
        </p>
      ) : (
        <div className="space-y-3">
          {rfqs.map((rfq) => {
            const assignedVendor = vendors.find((v) => v.id === rfq.assignedVendorId);
            return (
              <div key={rfq.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{rfq.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{rfq.description}</p>
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
                    {assignedVendor && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Assigned to: <span className="font-medium">{assignedVendor.name}</span>
                      </p>
                    )}
                  </div>

                  {canAssign && !rfq.assignedVendorId && activeVendors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded border bg-background px-2 py-1.5 text-sm"
                        value={assignVendorMap[rfq.id] ?? ""}
                        onChange={(e) =>
                          setAssignVendorMap({ ...assignVendorMap, [rfq.id]: e.target.value })
                        }
                      >
                        <option value="">Assign vendor…</option>
                        {activeVendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={!assignVendorMap[rfq.id] || assigningId === rfq.id}
                        onClick={() => handleAssignVendor(rfq.id)}
                        className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {assigningId === rfq.id ? "Assigning…" : "Assign"}
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
