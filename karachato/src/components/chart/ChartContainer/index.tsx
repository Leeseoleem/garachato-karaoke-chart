// === component ===
import KaraokeTabs from "../KaraokeTabs";
import ChartHeader from "./ChartHeader";
import ChartScrollContainer from "./ChartScrollContainer";

// === mock ====
import { MOCK_CHART_ITEMS } from "@/lib/mock";

export default function ChartContainer() {
  return (
    <div className="flex h-full flex-1 flex-col bg-linear-to-b from-brand-dark to-gray-30 overflow-hidden">
      <KaraokeTabs />
      <ChartHeader />
      <ChartScrollContainer items={MOCK_CHART_ITEMS} />
    </div>
  );
}
