import { HeroSkeleton } from "./HeroSkeleton";
import { InfoSkeleton } from "./InfoSkeleton";
import { VocalGuideSkeleton } from "./VocalGuideSkeleton";

export function SongDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <HeroSkeleton />
      <InfoSkeleton />
      <VocalGuideSkeleton />
      {/* 팁 섹션도 필요하면 동일하게 추가 */}
    </div>
  );
}
