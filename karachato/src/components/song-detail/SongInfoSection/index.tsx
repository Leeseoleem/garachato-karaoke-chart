import clsx from "clsx";
// === component ===
import DetailSection from "../DetailSection";
import SongInfoRow from "./SongInfoRow";
import Divider from "@/components/common/Divider";
// === type ===
import type { DeltaStatus } from "@/types/domain";

interface SongInfoSectionProps {
  rankInfo: {
    currentRank: number | null;
    currentStatus: DeltaStatus;
    previousRank: number | null;
  };
  description: string;
}

export default function SongInfoSection({
  rankInfo,
  description,
}: SongInfoSectionProps) {
  const paddingClass = "pl-1 py-2";
  return (
    <DetailSection label="곡 정보">
      <div className={clsx("flex flex-col gap-1 items-start", paddingClass)}>
        <SongInfoRow
          label="차트 순위"
          rank={rankInfo.currentRank}
          status={rankInfo.currentStatus}
        />
        <SongInfoRow label="전주 순위" rank={rankInfo.previousRank} />
      </div>
      <Divider />
      <div className={paddingClass}>
        <p className="typo-caption text-content-primary whitespace-pre-line wrap-break-word">
          {description}
        </p>
      </div>
    </DetailSection>
  );
}
