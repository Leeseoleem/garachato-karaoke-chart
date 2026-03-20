import clsx from "clsx";
import { DELTA_MAP } from "@/constants/status";
import type { DeltaStatus } from "@/types/domain";

interface SongInfoRowProps {
  label: string;
  status?: DeltaStatus;
  rank: number;
}

export default function SongInfoRow({ label, status, rank }: SongInfoRowProps) {
  const { symbol, className } = status
    ? (DELTA_MAP[status] ?? DELTA_MAP.UNKNOWN)
    : { symbol: undefined, className: undefined };

  return (
    <div className="flex flex-row h-6 w-full justify-between items-center">
      <p className="typo-description text-content-muted">{label}</p>
      <div className="flex flex-row items-center gap-2">
        {status && <p className={clsx("typo-tag", className)}>{symbol}</p>}
        <p
          className={clsx(
            "typo-caption",
            status ? className : "text-content-secondary",
          )}
        >
          {rank}위
        </p>
      </div>
    </div>
  );
}
