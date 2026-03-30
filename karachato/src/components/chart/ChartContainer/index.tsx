// === component ===
import ChartClientWrapper from "./ChartClientWrapper";
// === type ===
import type { KaraokeProvider } from "@/types/domain";
// === query ===
import { getChartByProvider } from "@/lib/chart/queries";

interface ChartContainerProps {
  provider: KaraokeProvider;
}

export default async function ChartContainer({
  provider,
}: ChartContainerProps) {
  const { items, latestDate } = await getChartByProvider(provider);

  return (
    <div className="flex flex-1 min-h-0">
      <ChartClientWrapper latestDate={latestDate} items={items} />
    </div>
  );
}
