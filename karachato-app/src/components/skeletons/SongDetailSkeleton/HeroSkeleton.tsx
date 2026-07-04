import { SkeletonBox } from "../SkeletonBox";
import { SkeletonText } from "../SkeletonText";

export function HeroSkeleton() {
  return (
    <div className="flex flex-col gap-6 items-start">
      <div className="flex flex-col gap-2 flex-1">
        {/* 곡명 - 가장 길고 굵은 텍스트니까 높이를 h-6으로 크게 */}
        <SkeletonText className="w-60 h-6" />
        {/* 가수명 */}
        <SkeletonText className="w-4/5 h-4" />
      </div>
      <div className="flex flex-row gap-4 items-center">
        <SkeletonBox className="w-9 h-9" />
        <div className="flex flex-col items-start gap-1">
          <SkeletonText className="w-12 h-4" />
          <SkeletonText className="w-10 h-4" />
        </div>
      </div>
      <SkeletonBox className="w-full aspect-video rounded-xl shrink-0" />
      <div className="flex w-full items-center gap-3">
        {/* 노래방 번호 배지 */}
        <SkeletonBox className="w-full h-10 rounded-full" />

        {/* 노래방 번호 배지 */}
        <SkeletonBox className="w-full h-10 rounded-full" />
      </div>
    </div>
  );
}
