"use client";
// === component ===
import { ChartInfoPopover } from "./ChartInfoPopover";
import KaraokeTabs from "../KaraokeTabs";
import ChartHeader from "./ChartHeader";
import { RankCardSkeleton } from "@/components/skeletons/RankCardSkeleton";

// 탭 전환 중 Suspense fallback.
// ChartClientWrapper와 같은 상단 구조(TOP100 헤더·탭·컬럼 헤더)를 그대로 두고
// 리스트만 스켈레톤으로 채운다. 탭은 URL(provider)로 active를 판단하므로 로딩
// 중에도 올바른 탭이 유지돼 전환 시 탭이 사라지거나 깜빡이지 않는다.
export function ChartTabLoadingFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-row justify-between px-5 py-3">
        <div className="flex items-center gap-1">
          <span className="typo-caption text-content-secondary">TOP 100</span>
          <ChartInfoPopover />
        </div>
      </div>
      <KaraokeTabs onScrollToTop={() => {}} />
      <div className="flex flex-1 flex-col min-h-0 bg-linear-to-b from-brand-dark to-gray-30 overflow-hidden">
        <ChartHeader />
        <div className="flex flex-col flex-1 min-h-0 overflow-y-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <RankCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
