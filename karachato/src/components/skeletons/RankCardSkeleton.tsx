import { SkeletonBox } from "./SkeletonBox";
import { SkeletonText } from "./SkeletonText";

export function RankCardSkeleton() {
  return (
    <div className="flex flex-row justify-between items-center w-full px-5 pt-4 pb-3 border-b border-gray-30">
      <div className="flex flex-row gap-5 items-center justify-center">
        <SkeletonBox className="w-10 h-15" elevated />
        <div className="flex flex-col items-start gap-3">
          {/* 제목 영역 */}
          <div className="flex flex-col items-start gap-1">
            <SkeletonText className="w-40 h-6" elevated />
            <SkeletonText className="w-3/5 h-5" elevated />
          </div>
          {/* 가수 영역 */}
          <div className="flex flex-col items-start gap-1">
            <SkeletonText className="w-12 h-4" elevated />
            <SkeletonText className="w-12 h-4" elevated />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 justify-center items-end">
        <SkeletonText className="w-12 h-4" elevated />
        <SkeletonBox className="w-12 h-6" elevated />
      </div>
    </div>
  );
}
