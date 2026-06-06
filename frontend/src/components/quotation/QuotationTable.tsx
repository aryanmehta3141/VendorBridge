import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuotationWithVendor } from "@/services/quotation.service";
import { QUOTATION_STATUS } from "@/utils/constants";

const STATUS_LABELS: Record<string, string> = {
  [QUOTATION_STATUS.QUOTATION_SUBMITTED]: "Pending",
  [QUOTATION_STATUS.PENDING_APPROVAL]: "Selected",
  [QUOTATION_STATUS.APPROVED]: "Approved",
  [QUOTATION_STATUS.REJECTED]: "Rejected",
};

interface QuotationTableProps {
  quotations: QuotationWithVendor[];
  canSelectWinner?: boolean;
  selectingId?: string | null;
  onSelectWinner?: (quotationId: string) => void;
}

export default function QuotationTable({
  quotations,
  canSelectWinner = false,
  selectingId = null,
  onSelectWinner,
}: QuotationTableProps) {
  const hasWinner = quotations.some(
    (q) => q.status === QUOTATION_STATUS.PENDING_APPROVAL
  );

  const comparable = quotations.filter(
    (q) => q.status === QUOTATION_STATUS.QUOTATION_SUBMITTED
  );

  const minPrice =
    comparable.length > 0
      ? Math.min(...comparable.map((q) => q.price))
      : null;

  const minDeliveryDays =
    comparable.length > 0
      ? Math.min(...comparable.map((q) => q.deliveryDays))
      : null;

  if (quotations.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No quotations submitted for this RFQ yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Delivery Days</th>
            <th className="px-4 py-3 font-medium">Comments</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {canSelectWinner && <th className="px-4 py-3 font-medium">Action</th>}
          </tr>
        </thead>
        <tbody>
          {quotations.map((quotation) => {
            const isCheapest =
              minPrice !== null &&
              quotation.status === QUOTATION_STATUS.QUOTATION_SUBMITTED &&
              quotation.price === minPrice;

            const isFastest =
              minDeliveryDays !== null &&
              quotation.status === QUOTATION_STATUS.QUOTATION_SUBMITTED &&
              quotation.deliveryDays === minDeliveryDays;

            const canSelect =
              canSelectWinner &&
              !hasWinner &&
              quotation.status === QUOTATION_STATUS.QUOTATION_SUBMITTED;

            return (
              <tr
                key={quotation.id}
                className={cn(
                  "border-b last:border-b-0",
                  isCheapest && "bg-green-50 dark:bg-green-950/20",
                  isFastest && !isCheapest && "bg-blue-50 dark:bg-blue-950/20",
                  isCheapest && isFastest && "bg-emerald-50 dark:bg-emerald-950/20"
                )}
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{quotation.vendor.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {quotation.vendor.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(isCheapest && "font-semibold text-green-700")}>
                    ${quotation.price.toFixed(2)}
                  </span>
                  {isCheapest && (
                    <span className="ml-2 text-xs text-green-700">Lowest</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(isFastest && "font-semibold text-blue-700")}
                  >
                    {quotation.deliveryDays}
                  </span>
                  {isFastest && (
                    <span className="ml-2 text-xs text-blue-700">Fastest</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {quotation.comments || "—"}
                </td>
                <td className="px-4 py-3">
                  {STATUS_LABELS[quotation.status] ?? quotation.status}
                </td>
                {canSelectWinner && (
                  <td className="px-4 py-3">
                    {canSelect ? (
                      <Button
                        size="sm"
                        disabled={selectingId === quotation.id}
                        onClick={() => onSelectWinner?.(quotation.id)}
                      >
                        {selectingId === quotation.id
                          ? "Selecting..."
                          : "Select Winner"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
