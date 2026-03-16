// === component ===
import ChartHeader from "./ChartHeader";
import RankCard from "./RankCard";

// === function ===
import { toRankCardPropsList } from "@/lib/mappers/chart";

// === type ===
import type { RankHistoryWithJoin } from "@/types/database";

export default function ChartList({ items }: { items: RankHistoryWithJoin[] }) {
  const mapperItems = toRankCardPropsList(items);
  return (
    <div>
      <ChartHeader />
      {mapperItems.map((item) => (
        <RankCard key={item.songId} {...item} />
      ))}
    </div>
  );
}
