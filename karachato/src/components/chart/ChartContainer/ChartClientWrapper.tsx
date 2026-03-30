"use client";
import { AnimatePresence, motion } from "framer-motion";
// === component ===
import KaraokeTabs from "../KaraokeTabs";
import ChartHeader from "./ChartHeader";
import ChartScrollContainer from "./ChartScrollContainer";
import FloatingBar from "../FloatingBar";

// === hook ===
import { useScrollTop } from "@/hooks/useScrollTop";

// === type ===
import type { RankHistoryWithJoin } from "@/types/database";

interface ChartClientWrapperProps {
  items: RankHistoryWithJoin[];
  latestDate: string;
}

export default function ChartClientWrapper({
  items,
  latestDate,
}: ChartClientWrapperProps) {
  const { scrollRef, isScrolled, isBottom } = useScrollTop();

  const handleScrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-row justify-between px-5 py-3">
        <span className="typo-caption text-content-secondary">TOP 100</span>
        <span className="typo-caption text-content-secondary">
          {latestDate} 기준
        </span>
      </div>
      <KaraokeTabs onScrollToTop={handleScrollToTop} />
      <div className="flex flex-1 flex-col min-h-0 bg-linear-to-b from-brand-dark to-gray-30 overflow-hidden">
        <ChartHeader />
        <ChartScrollContainer ref={scrollRef} items={items} />
      </div>
      <AnimatePresence>
        {!isBottom && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
          >
            <FloatingBar
              isScrolled={isScrolled}
              onScrollToTop={handleScrollToTop}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
