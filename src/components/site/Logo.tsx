import { Flame } from "lucide-react";

// Placeholder mark until the owner's circular logo is uploaded.
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-gold bg-card shadow-soft">
        <span className="absolute inset-1 rounded-full border border-ink" />
        <Flame className="h-5 w-5 animate-flicker text-gold" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-xl font-semibold tracking-wide text-ink">KUSASA-ELIHLE</span>
          <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Essential Candles</span>
        </span>
      )}
    </span>
  );
}
