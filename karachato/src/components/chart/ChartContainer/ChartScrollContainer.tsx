"use client";
import { forwardRef } from "react";

// === component ===
import RankCard from "../RankCard";

// === function ===
import { toRankCardPropsList } from "@/lib/mappers/chart";

// === type ===
import type { RankHistoryWithJoin } from "@/types/database";

const ChartScrollContainer = forwardRef<
  HTMLDivElement,
  { items: RankHistoryWithJoin[] }
>(({ items }, ref) => {
  const mapperItems = toRankCardPropsList(items);
  return (
    <div ref={ref} className="flex-1 min-h-0 overflow-y-auto">
      {mapperItems.map((item) => (
        <RankCard key={item.songId} {...item} />
      ))}
    </div>
  );
});

ChartScrollContainer.displayName = "ChartScrollContainer";
export default ChartScrollContainer;
