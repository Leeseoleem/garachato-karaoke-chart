import clsx from "clsx";
import type { DeltaStatus } from "@/types/domain";
import { DELTA_MAP } from "@/constants/status";

export interface RankBadgeProps {
  status: DeltaStatus;
}

export default function RankBadge({ status }: RankBadgeProps) {
  const { symbol, className } = DELTA_MAP[status] ?? DELTA_MAP.UNKNOWN;
  const baseClass = "w-8 h-8 flex justify-center items-center typo-tag";
  return <p className={clsx(baseClass, className)}>{symbol}</p>;
}
