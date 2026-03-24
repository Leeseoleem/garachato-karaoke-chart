import { HeroSkeleton } from "./HeroSkeleton";
import { InfoSkeleton } from "./InfoSkeleton";
import { VocalGuideSkeleton } from "./VocalGuideSkeleton";

export function SongDetailSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <HeroSkeleton />
      <InfoSkeleton />
      <VocalGuideSkeleton />
    </div>
  );
}
