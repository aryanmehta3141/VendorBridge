import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import QuotationForm from "@/components/quotation/QuotationForm";
import { Button } from "@/components/ui/button";
import { get } from "@/services/api";
import type { Rfq } from "@/types/rfq";
import { USER_ROLES } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";

interface RfqListResponse {
  data: Rfq[];
}

export default function VendorPortal() {
  const { role } = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRfqId, setActiveRfqId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadRfqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<RfqListResponse>("/rfqs");
      const assigned = response.data.filter((rfq) => rfq.assignedVendorId);
      setRfqs(assigned);
    } catch {
      setError("Failed to load assigned RFQs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRfqs();
  }, [loadRfqs]);

  const handleQuotationSuccess = () => {
    setActiveRfqId(null);
    setSuccessMessage("Quotation submitted successfully.");
    loadRfqs();
  };

  if (role !== USER_ROLES.VENDOR) {
    return (
      <div>
        <PageHeader
          title="Vendor Portal"
          description="Assigned RFQs and quotations"
        />
        <p className="text-muted-foreground">
          Log in as a Vendor to view assigned RFQs and submit quotations.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Vendor Portal"
        description="Assigned RFQs and quotations"
      />

      {successMessage && (
        <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          {successMessage}
        </p>
      )}

      {loading && <Loading />}

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && rfqs.length === 0 && (
        <p className="text-muted-foreground">
          No RFQs assigned to you yet.
        </p>
      )}

      {!loading && !error && rfqs.length > 0 && (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{rfq.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {rfq.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Qty: {rfq.quantity}</span>
                    <span>
                      Deadline:{" "}
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </span>
                    <span>Status: {rfq.status}</span>
                  </div>
                </div>
                {activeRfqId !== rfq.id && (
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
    </div>
  );
}
