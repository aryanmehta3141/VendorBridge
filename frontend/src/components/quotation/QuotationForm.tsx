import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { createQuotation } from "@/services/quotation.service";

interface QuotationFormProps {
  rfqId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function QuotationForm({
  rfqId,
  onSuccess,
  onCancel,
}: QuotationFormProps) {
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsedPrice = Number(price);
    const parsedDeliveryDays = Number(deliveryDays);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Price must be a number greater than 0.");
      return;
    }

    if (!Number.isInteger(parsedDeliveryDays) || parsedDeliveryDays <= 0) {
      setError("Delivery days must be a positive whole number.");
      return;
    }

    setSubmitting(true);
    try {
      await createQuotation({
        rfqId,
        price: parsedPrice,
        deliveryDays: parsedDeliveryDays,
        comments: comments.trim() || undefined,
      });
      setPrice("");
      setDeliveryDays("");
      setComments("");
      onSuccess?.();
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
          : "Failed to submit quotation.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-lg border bg-muted/20 p-4"
    >
      <h3 className="text-sm font-semibold">Submit Quotation</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Price</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="0.00"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Delivery Days</span>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={deliveryDays}
            onChange={(e) => setDeliveryDays(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="e.g. 14"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Comments</span>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Optional notes about your quotation"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Quotation"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
