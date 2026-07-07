import { Suspense } from "react";
// === component ===
import SearchSection from "@/components/search/SearchSection";
import ChartContainer from "@/components/chart/ChartContainer";
import SettingModal from "@/components/modals/SettingModal";
import ChatModal from "@/components/modals/ChatModal";
import { ChartTabLoadingFallback } from "@/components/chart/ChartContainer/ChartTabLoadingFallback";
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
    <main className="flex h-dvh flex-col relative overflow-hidden">
      <SearchSection />
      {/* provider를 key로 줘, 탭 전환 때마다 탭은 고정한 채 리스트만 스켈레톤으로 두고 데이터가 오면 교체한다 */}
      <Suspense key={karaokeProvider} fallback={<ChartTabLoadingFallback />}>
        <ChartContainer provider={karaokeProvider} />
      </Suspense>
      <SettingModal />
      <ChatModal />
    </main>
  );
}
