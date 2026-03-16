import clsx from "clsx";
import type { DeltaStatus } from "@/types/domain";

export interface RankBadgeProps {
  status: DeltaStatus;
}

const DELTA_MAP: Record<DeltaStatus, { symbol: string; className: string }> = {
  UP: { symbol: "▲", className: "text-status-up" },
  DOWN: { symbol: "▼", className: "text-status-down" },
  SAME: { symbol: "—", className: "text-content-muted" },
  NEW: { symbol: "NEW", className: "text-brand-accent" },
  UNKNOWN: { symbol: "—", className: "text-content-muted" },
};

export default function RankBadge({ status }: RankBadgeProps) {
  const { symbol, className } = DELTA_MAP[status];
  const baseClass = "w-8 h-8 flex justify-center items-center typo-tag";
  return <p className={clsx(baseClass, className)}>{symbol}</p>;
}
