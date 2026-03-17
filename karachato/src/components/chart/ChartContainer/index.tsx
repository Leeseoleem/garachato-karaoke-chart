// === component ===
import KaraokeTabs from "../KaraokeTabs";
import ChartHeader from "./ChartHeader";
import ChartScrollContainer from "./ChartScrollContainer";

// === mock ====
import { MOCK_CHART_ITEMS } from "@/lib/mock";

export default function ChartContainer() {
  return (
    <div>
      <KaraokeTabs />
      <ChartHeader />
      <ChartScrollContainer items={MOCK_CHART_ITEMS} />
    </div>
  );
}
