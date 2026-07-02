import SearchSection from "@/components/search/SearchSection";
import ChartClientWrapper from "@/components/chart/ChartContainer/ChartClientWrapper";
import { MOCK_CHART_ITEMS } from "@/lib/mock";
import type { ChartRow } from "@/types/database";

// S3 임시: 목 데이터로 홈 렌더 (S2에서 실제 Supabase 데이터로 교체)
export default function Home() {
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      <SearchSection />
      <ChartClientWrapper
        items={MOCK_CHART_ITEMS as unknown as ChartRow[]}
        latestDate="2026-03-17"
      />
    </main>
  );
}
