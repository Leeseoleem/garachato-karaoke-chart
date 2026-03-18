// === component ===
import ChartContainer from "@/components/chart/ChartContainer";
// === function ===
import { isKaraokeProvider } from "@/utils/type";
// === type ===
import type { KaraokeProvider } from "@/types/domain";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const { provider } = await searchParams;
  const karaokeProvider: KaraokeProvider =
    provider && isKaraokeProvider(provider) ? provider : "TJ";

  return (
    <main className="flex h-screen flex-col">
      <ChartContainer provider={karaokeProvider} />
    </main>
  );
}
