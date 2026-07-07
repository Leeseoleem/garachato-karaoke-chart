"use client";
// === component ===
import { ChartInfoPopover } from "./ChartInfoPopover";
import KaraokeTabs from "../KaraokeTabs";
import ChartHeader from "./ChartHeader";
import ChartScrollContainer from "./ChartScrollContainer";
import FloatingBar from "../FloatingBar";
import { RankCardSkeleton } from "@/components/skeletons/RankCardSkeleton";

// === hook ===
import { useScrollTop } from "@/hooks/useScrollTop";

// === type ===
import type { ChartRow } from "@/types/database";

interface ChartClientWrapperProps {
  items: ChartRow[];
  latestDate: string;
  // 탭 전환 재조회 중이면 탭·헤더는 유지하고 리스트만 스켈레톤으로 둔다
  loading?: boolean;
}

export default function ChartClientWrapper({
  items,
  latestDate,
  loading = false,
}: ChartClientWrapperProps) {
  const { scrollRef, isScrolled, isBottom } = useScrollTop();

  const handleScrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex flex-row justify-between px-5 py-3">
        <div className="flex items-center gap-1">
          <span className="typo-caption text-content-secondary">TOP 100</span>
          <ChartInfoPopover />
        </div>
        <span className="typo-caption text-content-secondary">
          {latestDate} 기준
        </span>
      </div>
      <KaraokeTabs onScrollToTop={handleScrollToTop} />
      <div className="flex flex-1 flex-col min-h-0 bg-linear-to-b from-brand-dark to-gray-30 overflow-hidden">
        <ChartHeader />
        {loading ? (
          <div className="flex flex-col flex-1 min-h-0 overflow-y-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <RankCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ChartScrollContainer ref={scrollRef} items={items} />
        )}
      </div>
      <FloatingBar
        isScrolled={isScrolled}
        isVisible={!isBottom}
        onScrollToTop={handleScrollToTop}
      />
    </div>
  );
}
