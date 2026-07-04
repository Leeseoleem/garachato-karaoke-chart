import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchSection from "@/components/search/SearchSection";
import ChartClientWrapper from "@/components/chart/ChartContainer/ChartClientWrapper";
import SettingModal from "@/components/modals/SettingModal";
import ChatModal from "@/components/modals/ChatModal";
import { MainPageSkeleton } from "@/components/skeletons/pages/MainPageSkeleton";
import { getChartByProvider } from "@/lib/chart/queries";
import { isKaraokeProvider } from "@/utils/type";
import type { ChartRow } from "@/types/database";
import type { KaraokeProvider } from "@/types/domain";

// 실제 Supabase(publishable 키 + RLS) 클라 fetch.
// provider는 URL(?provider)을 단일 source of truth로 사용해 탭과 데이터를 일치시킴.
export default function Home() {
  const [searchParams] = useSearchParams();
  const providerParam = searchParams.get("provider");
  const provider: KaraokeProvider =
    providerParam && isKaraokeProvider(providerParam) ? providerParam : "TJ";

  const [items, setItems] = useState<ChartRow[]>([]);
  const [latestDate, setLatestDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getChartByProvider(provider)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setLatestDate(res.latestDate ?? "");
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[Home] 차트 로드 실패", e);
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provider, reloadKey]);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      {loading ? (
        <MainPageSkeleton />
      ) : (
        <>
          <SearchSection />
          {error ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
              <div className="flex flex-col gap-1">
                <p className="typo-title text-content-primary">
                  차트를 불러오지 못했어요.
                </p>
                <p className="typo-caption text-content-secondary">
                  잠시 후 다시 시도해 주세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="rounded-full bg-brand-main px-5 py-2 typo-body text-gray-white active:opacity-80 transition-opacity"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <ChartClientWrapper items={items} latestDate={latestDate} />
          )}
        </>
      )}
      <SettingModal />
      <ChatModal />
    </main>
  );
}
