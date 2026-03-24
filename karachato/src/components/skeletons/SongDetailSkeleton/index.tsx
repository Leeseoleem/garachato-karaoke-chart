import { HeroSkeleton } from "./HeroSkeleton";
import { InfoSkeleton } from "./InfoSkeleton";
import { VocalGuideSkeleton } from "./VocalGuideSkeleton";

export function SongDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <HeroSkeleton />
      <InfoSkeleton />
      <VocalGuideSkeleton />
    </div>
  );
}
