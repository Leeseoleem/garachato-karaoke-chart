import clsx from "clsx";
// === component ===
import DetailSection from "../DetailSection";
import SongInfoRow from "./SongInfoRow";
import Divider from "@/components/common/Divider";
import Tag from "../Tag";
// === type ===
import type { DeltaStatus } from "@/types/domain";

interface SongInfoSectionProps {
  rankInfo: {
    currentRank: number | null;
    currentStatus: DeltaStatus;
    previousRank: number | null;
  };
  tags: string[];
}

export default function SongInfoSection({
  rankInfo,
  tags,
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
      <div className={clsx(paddingClass, "flex flex-col gap-2 items-start")}>
        <div className="shrink-0 flex flex-row items-center gap-x-2 flex-wrap">
          {tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>
    </DetailSection>
  );
}
