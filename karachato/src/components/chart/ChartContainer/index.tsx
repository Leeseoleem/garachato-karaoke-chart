// === component ===
import KaraokeTabs from "../KaraokeTabs";
import ChartHeader from "./ChartHeader";
import ChartScrollContainer from "./ChartScrollContainer";

// === type ===
import type { KaraokeProvider } from "@/types/domain";

// === mock ====
import { MOCK_CHART_ITEMS } from "@/lib/mock";

interface ChartContainerProps {
  provider: KaraokeProvider;
}

export default function ChartContainer({ provider }: ChartContainerProps) {
  // TODO: provider 기반으로 Supabase 쿼리
  return (
    <div className="flex h-full flex-1 flex-col bg-linear-to-b from-brand-dark to-gray-30 overflow-hidden">
      <KaraokeTabs />
      <ChartHeader />
      <ChartScrollContainer items={MOCK_CHART_ITEMS} />
    </div>
  );
}
