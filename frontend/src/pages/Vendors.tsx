import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get, post, put, del } from "@/services/api";
import type { Vendor } from "@/types/vendor";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/utils/constants";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const EMPTY_FORM = { name: "", email: "", category: "", status: "ACTIVE" as const };

export default function Vendors() {
  const { role } = useAuth();
  // ADMIN can view; PROCUREMENT_OFFICER can create/edit/delete
  const canMutate = role === USER_ROLES.PROCUREMENT_OFFICER || role === USER_ROLES.ADMIN;

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  async function loadVendors() {
    setLoading(true);
    setError(null);
    try {
      const res = await get<ApiResponse<Vendor[]>>("/vendors");
      setVendors(res.data);
    } catch {
      setError("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  function openAdd() {
    setEditingVendor(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(vendor: Vendor) {
    setEditingVendor(vendor);
    setForm({ name: vendor.name, email: vendor.email, category: vendor.category, status: vendor.status });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingVendor(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingVendor) {
        await put<ApiResponse<Vendor>>(`/vendors/${editingVendor.id}`, form);
      } else {
        await post<ApiResponse<Vendor>>("/vendors", form);
      }
      cancelForm();
      await loadVendors();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save vendor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete vendor "${name}"?`)) return;
    setError(null);
    try {
      await del(`/vendors/${id}`);
      await loadVendors();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to delete vendor.");
    }
  }

  return (
    <div>
      <PageHeader title="Vendors" description="Vendor management" />

      <div className="mb-4 flex items-center justify-between">
        {canMutate && (
          <button
            onClick={openAdd}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Vendor
          </button>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {canMutate && showForm && (
        <div className="mb-6 rounded-lg border bg-muted/20 p-4">
          <h2 className="mb-3 text-base font-semibold">
            {editingVendor ? "Edit Vendor" : "New Vendor"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                required
                type="email"
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "INACTIVE" })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Saving..." : editingVendor ? "Update" : "Create"}
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
      ) : vendors.length === 0 ? (
        <p className="text-muted-foreground">
          {canMutate ? "No vendors yet. Add one above." : "No vendors found."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canMutate && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email}</td>
                  <td className="px-4 py-3">{v.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  {canMutate && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(v)}
                        className="mr-2 text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.name)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
