import type { DeltaStatus } from "@/types/domain";

export const DELTA_MAP: Record<
  DeltaStatus,
  { symbol: string; className: string }
> = {
  UP: { symbol: "▲", className: "text-status-up" },
  DOWN: { symbol: "▼", className: "text-status-down" },
  SAME: { symbol: "—", className: "text-content-muted" },
  NEW: { symbol: "NEW", className: "text-brand-accent" },
  UNKNOWN: { symbol: "—", className: "text-content-muted" },
};
