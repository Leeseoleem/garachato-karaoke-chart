import { SkeletonBox } from "./SkeletonBox";
import { SkeletonText } from "./SkeletonText";

export function SearchResultItemSkeleton() {
  return (
    <div className="flex justify-between items-center px-5 pt-3 pb-4 border-b border-gray-30">
      <div className="flex-1 flex flex-col gap-1 items-start justify-center">
        {/* 곡명: 전체 너비의 60% 정도 */}
        <SkeletonText className="w-3/5 h-6" />
        {/* 가수명: 곡명보다 짧게 */}
        <SkeletonText className="w-1/5 h-4" />
      </div>

      {/* 배지 + 번호 영역 */}
      <div className="flex flex-col h-full items-start gap-1">
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-9 h-5 rounded-full" /> {/* TJ 배지 */}
          <SkeletonText className="w-16 h-3" /> {/* 노래방 번호 */}
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-9 h-5 rounded-full" /> {/* KY 배지 */}
          <SkeletonText className="w-16 h-3" /> {/* 노래방 번호 */}
        </div>
      </div>
    </div>
  );
}
