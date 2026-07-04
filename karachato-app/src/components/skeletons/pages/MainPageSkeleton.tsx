import { AudioLines } from "lucide-react";
import { ChartListSkeleton } from "../ChartListSkeleton";

export function MainPageSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-row w-full h-25 px-4 items-center gap-3">
        <div className="flex items-center w-full px-5 pr-12 h-13 rounded-full search-border outline-none bg-transparent">
          <p className="typo-body text-brand-main/60">
            원하는 곡을 검색해보세요!
          </p>
        </div>
        <div className="shrink-0 flex items-center justify-center rounded-full glass h-12 w-12">
          <AudioLines size={20} color="#ffffff" />
        </div>
      </div>
      <ChartListSkeleton />
    </div>
  );
}
