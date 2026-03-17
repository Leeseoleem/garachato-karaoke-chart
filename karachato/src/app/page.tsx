// === component ===
import ChartContainer from "@/components/chart/ChartContainer";
// === function ===
import { isKaraokeProvider } from "@/utils/type";
// === type ===
import type { KaraokeProvider } from "@/types/domain";

export default function Home({
  searchParams,
}: {
  searchParams: { provider?: string };
}) {
  const provider: KaraokeProvider =
    searchParams.provider && isKaraokeProvider(searchParams.provider)
      ? searchParams.provider
      : "TJ";
  return (
    <main className="flex h-screen flex-col">
      <ChartContainer provider={provider} />
    </main>
  );
}
