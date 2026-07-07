import { createServerClient } from "@/lib/supabase/server";
import { fetchTJJpopChart } from "@/lib/crawlers/tj";
import { fetchKYJpopChart } from "@/lib/crawlers/ky";
import { processCrawledSongs } from "@/lib/crawlers/process";
import type { ProcessResult } from "@/lib/crawlers/process";
import type { CrawledSong } from "@/types/crawler";
import type { KaraokeProvider } from "@/types/domain";

import { checkAuth } from "@/utils/auth";
import { getToday } from "@/utils/date";

export const maxDuration = 60;

// provider별 처리 결과. 성공/실패 모두 동일한 스키마(ProcessResult + error)로 통일해,
// 응답을 소비하는 모니터링/알림이 형태를 분기하지 않아도 되게 한다.
type ProviderOutcome = ProcessResult & { error: string | null };

// 한 provider의 크롤·적재를 격리 실행한다. 실패해도 throw하지 않고 error를 담아 반환해,
// 한 provider의 장애가 다른 provider 처리를 막지 않게 한다.
async function runProvider(
  supabase: ReturnType<typeof createServerClient>,
  provider: KaraokeProvider,
  fetchChart: () => Promise<CrawledSong[]>,
  today: string,
): Promise<ProviderOutcome> {
  try {
    const songs = await fetchChart();
    const result = await processCrawledSongs(supabase, songs, provider, today);
    return { ...result, error: null };
  } catch (e) {
    console.error(`[cron] ${provider} 크롤/적재 실패:`, e);
    return { fetched: 0, processed: 0, failed: 0, error: String(e) };
  }
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const today = getToday();

    // TJ, KY를 각각 격리 실행한다(한쪽 실패가 다른쪽을 막지 않음).
    // KY는 TJ가 이번에 만든 song을 재사용하도록 TJ 다음에 순차 실행한다.
    const tj = await runProvider(supabase, "TJ", fetchTJJpopChart, today);
    const ky = await runProvider(supabase, "KY", fetchKYJpopChart, today);

    const hasFailures =
      tj.error !== null || ky.error !== null || tj.failed > 0 || ky.failed > 0;

    return Response.json(
      { ok: !hasFailures, tj, ky, date: today },
      { status: hasFailures ? 500 : 200 },
    );
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
