import { cn } from "@/lib/utils";
import type { QuotationWithVendor } from "@/services/quotation.service";
import { QUOTATION_STATUS } from "@/utils/constants";
import { Trophy, Zap, Award } from "lucide-react";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  [QUOTATION_STATUS.QUOTATION_SUBMITTED]: { label: "Submitted",      cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  [QUOTATION_STATUS.PENDING_APPROVAL]:    { label: "Selected ★",     cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  [QUOTATION_STATUS.APPROVED]:            { label: "Approved",        cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  [QUOTATION_STATUS.REJECTED]:            { label: "Rejected",        cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

interface QuotationTableProps {
  quotations: QuotationWithVendor[];
  canSelectWinner?: boolean;
  selectingId?: string | null;
  onSelectWinner?: (id: string) => void;
}

export default function QuotationTable({
  quotations,
  canSelectWinner = false,
  selectingId = null,
  onSelectWinner,
}: QuotationTableProps) {
  const hasWinner = quotations.some((q) => q.status === QUOTATION_STATUS.PENDING_APPROVAL);
  const comparable = quotations.filter((q) => q.status === QUOTATION_STATUS.QUOTATION_SUBMITTED);
  const minPrice = comparable.length > 0 ? Math.min(...comparable.map((q) => q.price)) : null;
  const minDays = comparable.length > 0 ? Math.min(...comparable.map((q) => q.deliveryDays)) : null;

  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-14 text-center">
        <Award className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No quotations submitted for this RFQ yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border/40 bg-muted/20 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-xs text-emerald-400"><Trophy className="h-3 w-3" />Lowest price</span>
        <span className="flex items-center gap-1.5 text-xs text-blue-400"><Zap className="h-3 w-3" />Fastest delivery</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-border/40 bg-muted/10">
            <tr>
              {["Vendor", "Price", "Delivery", "Comments", "Status", ...(canSelectWinner ? ["Action"] : [])].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => {
              const isCheapest = minPrice !== null && q.status === QUOTATION_STATUS.QUOTATION_SUBMITTED && q.price === minPrice;
              const isFastest  = minDays  !== null && q.status === QUOTATION_STATUS.QUOTATION_SUBMITTED && q.deliveryDays === minDays;
              const canSelect  = canSelectWinner && !hasWinner && q.status === QUOTATION_STATUS.QUOTATION_SUBMITTED;
              const meta = STATUS_META[q.status] ?? { label: q.status, cls: "bg-muted text-muted-foreground border-border" };

              return (
                <tr
                  key={q.id}
                  className={cn(
                    "border-b border-border/30 transition-colors last:border-0",
                    "hover:bg-muted/20",
                    isCheapest && isFastest && "bg-emerald-500/5",
                    isCheapest && !isFastest && "bg-emerald-500/5",
                    isFastest  && !isCheapest && "bg-blue-500/5",
                  )}
                >
                  {/* Vendor */}
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-foreground">{q.vendor.name}</p>
                    <p className="text-xs text-muted-foreground">{q.vendor.email}</p>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("font-semibold tabular-nums", isCheapest ? "text-emerald-400" : "text-foreground")}>
                        ₹{q.price.toLocaleString()}
                      </span>
                      {isCheapest && (
                        <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                          <Trophy className="h-2.5 w-2.5" />Lowest
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Delivery */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("tabular-nums", isFastest ? "font-semibold text-blue-400" : "text-foreground")}>
                        {q.deliveryDays}d
                      </span>
                      {isFastest && (
                        <span className="flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                          <Zap className="h-2.5 w-2.5" />Fastest
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Comments */}
                  <td className="px-4 py-3.5 max-w-[160px]">
                    <p className="truncate text-xs text-muted-foreground">{q.comments || "—"}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", meta.cls)}>
                      {meta.label}
                    </span>
                  </td>

                  {/* Action */}
                  {canSelectWinner && (
                    <td className="px-4 py-3.5">
                      {canSelect ? (
                        <button
                          disabled={selectingId === q.id}
                          onClick={() => onSelectWinner?.(q.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm shadow-primary/20"
                        >
                          <Trophy className="h-3 w-3" />
                          {selectingId === q.id ? "Selecting…" : "Select Winner"}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
