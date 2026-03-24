// === component ===
import ChartContainer from "@/components/chart/ChartContainer";
import SettingModal from "@/components/modals/SettingModal";
// === function ===
import { isKaraokeProvider } from "@/utils/type";
// === type ===
import type { KaraokeProvider } from "@/types/domain";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string | string[] }>;
}) {
  const { provider: providerParam } = await searchParams;
  const normalizedProvider =
    typeof providerParam === "string" ? providerParam : undefined;

  const karaokeProvider: KaraokeProvider =
    normalizedProvider && isKaraokeProvider(normalizedProvider)
      ? normalizedProvider
      : "TJ";

  return (
    <main className="flex h-dvh flex-col">
      <ChartContainer provider={karaokeProvider} />
      <SettingModal />
    </main>
  );
}
