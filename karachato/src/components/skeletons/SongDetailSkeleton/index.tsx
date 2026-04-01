import BackHeader from "@/components/common/headers/BackHeader";
import { HeroSkeleton } from "./HeroSkeleton";
import { InfoSkeleton } from "./InfoSkeleton";
import { VocalGuideSkeleton } from "./VocalGuideSkeleton";

export function SongDetailSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <BackHeader title="곡 상세 정보" />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <HeroSkeleton />
        <InfoSkeleton />
        <VocalGuideSkeleton />
      </div>
    </div>
  );
}
