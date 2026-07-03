import DetailHeader from "@/components/common/headers/DetailHeader";
import { HeroSkeleton } from "./HeroSkeleton";
import { InfoSkeleton } from "./InfoSkeleton";
import { VocalGuideSkeleton } from "./VocalGuideSkeleton";

export function SongDetailSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <DetailHeader />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        <HeroSkeleton />
        <InfoSkeleton />
        <VocalGuideSkeleton />
      </div>
    </div>
  );
}
