// === component ===
import ChartClientWrapper from "./ChartClientWrapper";

// === type ===
import type { KaraokeProvider } from "@/types/domain";

// === mock ====
import { MOCK_CHART_ITEMS } from "@/lib/mock";

interface ChartContainerProps {
  provider: KaraokeProvider;
}

export default function ChartContainer({ provider }: ChartContainerProps) {
  // TODO: provider 기반으로 Supabase 쿼리 처리
  // TODO: latestDate도 DB에서 가져올 예정
  const latestDate = "2026.03.18"; // 임시 하드코딩

  return (
    <div className="flex flex-1 min-h-0">
      <ChartClientWrapper latestDate={latestDate} items={MOCK_CHART_ITEMS} />
    </div>
  );
}
