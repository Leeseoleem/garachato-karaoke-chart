import { SkeletonBox } from "../SkeletonBox";
import { SkeletonText } from "../SkeletonText";

export function VocalGuideSkeleton() {
  return (
    <div>
      <div className="flex flex-col p-4 gap-3">
        <SkeletonText className="w-10 h-3" />
        <div className="flex flex-col items-start px-4 py-5 gap-3 border gradient-border rounded-xl">
          <div className="flex flex-col w-full items-start gap-2">
            <SkeletonBox className="w-20 h-6" />
            <div className="flex flex-col w-full gap-2">
              <SkeletonText className="w-10 h-3" />
              <SkeletonBox className="w-full h-6 rounded-full" />
              <SkeletonBox className="w-4/5 h-6 rounded-full" />
            </div>
            <div className="flex flex-col w-full gap-2">
              <SkeletonText className="w-10 h-3" />
              <SkeletonBox className="w-full h-6 rounded-full" />
              <SkeletonBox className="w-4/5 h-6 rounded-full" />
            </div>
            <div className="w-full h-[1px] bg-brand-main" />
            <div className="flex flex-col w-full gap-2">
              <SkeletonText className="w-10 h-3" />
              <SkeletonBox className="w-full h-6 rounded-full" />
              <SkeletonBox className="w-4/5 h-6 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
