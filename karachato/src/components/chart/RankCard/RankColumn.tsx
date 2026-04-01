import RankBadge from "@/components/common/badges/RankBadge";
import type { DeltaStatus } from "@/types/domain";

export interface RankColumnProps {
  rank: number;
  status: DeltaStatus;
}

export default function RankColumn({ rank, status }: RankColumnProps) {
  return (
    <div className="w-10 h-15 gap-2 flex flex-col justify-center items-center">
      <p className="typo-title-02 text-content-primary">{rank}</p>
      <RankBadge status={status} />
    </div>
  );
}
