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

interface RfqListResponse {
  data: Rfq[];
}

export default function Quotations() {
  const { role } = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState("");
  const [quotations, setQuotations] = useState<QuotationWithVendor[]>([]);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const canSelectWinner =
    role === USER_ROLES.PROCUREMENT_OFFICER || role === USER_ROLES.ADMIN;

  useEffect(() => {
    async function loadRfqs() {
      setLoadingRfqs(true);
      setError(null);
      try {
        const response = await get<RfqListResponse>("/rfqs");
        setRfqs(response.data);
        if (response.data.length > 0) {
          setSelectedRfqId(response.data[0].id);
        }
      } catch {
        setError("Failed to load RFQs.");
      } finally {
        setLoadingRfqs(false);
      }
    }

    loadRfqs();
  }, []);

  const loadQuotations = useCallback(async (rfqId: string) => {
    if (!rfqId) {
      setQuotations([]);
      return;
    }

    setLoadingQuotations(true);
    setError(null);
    try {
      const data = await getQuotationsByRfq(rfqId);
      setQuotations(data);
    } catch {
      setError("Failed to load quotations for this RFQ.");
      setQuotations([]);
    } finally {
      setLoadingQuotations(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRfqId) {
      loadQuotations(selectedRfqId);
    }
  }, [selectedRfqId, loadQuotations]);

  const handleSelectWinner = async (quotationId: string) => {
    setSelectingId(quotationId);
    setError(null);
    try {
      await selectQuotationWinner(quotationId);
      await loadQuotations(selectedRfqId);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Failed to select winner.";
      setError(message);
    } finally {
      setSelectingId(null);
    }
  };

  const selectedRfq = rfqs.find((rfq) => rfq.id === selectedRfqId);

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="Compare vendor quotations"
      />

      {loadingRfqs && <Loading />}

      {!loadingRfqs && rfqs.length === 0 && (
        <p className="text-muted-foreground">
          No RFQs available. Create and assign RFQs first.
        </p>
      )}

      {!loadingRfqs && rfqs.length > 0 && (
        <div className="space-y-6">
          <label className="block max-w-md space-y-1.5">
            <span className="text-sm font-medium">Select RFQ</span>
            <select
              value={selectedRfqId}
              onChange={(e) => setSelectedRfqId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {rfqs.map((rfq) => (
                <option key={rfq.id} value={rfq.id}>
                  {rfq.title}
                </option>
              ))}
            </select>
          </label>

          {selectedRfq && (
            <div className="rounded-lg border bg-muted/20 p-4 text-sm">
              <p className="font-medium">{selectedRfq.title}</p>
              <p className="mt-1 text-muted-foreground">
                {selectedRfq.description}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {loadingQuotations ? (
            <Loading />
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
