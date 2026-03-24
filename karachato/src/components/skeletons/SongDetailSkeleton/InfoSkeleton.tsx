import { SkeletonBox } from "../SkeletonBox";
import { SkeletonText } from "../SkeletonText";
import Divider from "@/components/common/Divider";

export function InfoSkeleton() {
  return (
    <div className="flex flex-col p-4 gap-3">
      <SkeletonText className="w-10 h-3" />
      <div className="flex flex-col gap-1 items-start">
        <div className="flex flex-row w-full justify-between items-center">
          <SkeletonText className="w-12 h-4" />
          <SkeletonText className="w-12 h-4" />
        </div>
        <div className="flex flex-row w-full justify-between items-center">
          <SkeletonText className="w-12 h-4" />
          <SkeletonText className="w-12 h-4" />
        </div>
      </div>
      <Divider />
      <div className="flex flex-col w-full gap-2 flex-wrap">
        <SkeletonBox className="w-full h-6 rounded-full" />
        <SkeletonBox className="w-4/5 h-6 rounded-full" />
        <SkeletonBox className="w-full h-6 rounded-full" />
        <SkeletonBox className="w-2/5 h-6 rounded-full" />
      </div>
      <div className="flex gap-2">
        <SkeletonText className="w-12 h-4" />
        <SkeletonText className="w-12 h-4" />
        <SkeletonText className="w-12 h-4" />
      </div>
    </div>
  );
}
