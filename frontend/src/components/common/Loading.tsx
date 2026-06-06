import { Loader2 } from "lucide-react";

export default function Loading({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
      <Loader2 className="animate-spin-slow h-4 w-4" />
      {text}
    </div>
  );
}
