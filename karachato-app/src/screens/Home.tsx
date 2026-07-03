import { useEffect, useState } from "react";
import SearchSection from "@/components/search/SearchSection";
import ChartClientWrapper from "@/components/chart/ChartContainer/ChartClientWrapper";
import { getChartByProvider } from "@/lib/chart/queries";
import type { ChartRow } from "@/types/database";

// 실제 Supabase(publishable 키 + RLS) 클라 fetch. 현재 TJ 고정.
export default function Home() {
  const [items, setItems] = useState<ChartRow[]>([]);
  const [latestDate, setLatestDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getChartByProvider("TJ")
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setLatestDate(res.latestDate ?? "");
      })
      .catch((e) => console.error("[Home] 차트 로드 실패", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      <SearchSection />
      {loading ? (
        <div className="flex flex-1 items-center justify-center typo-caption text-content-secondary">
          차트를 불러오는 중…
        </div>
      ) : (
        <ChartClientWrapper items={items} latestDate={latestDate} />
      )}
    </main>
  );
}
