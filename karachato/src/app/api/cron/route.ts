import { createServerClient } from "@/lib/supabase/server";
import { fetchTJJpopChart } from "@/lib/crawlers/tj";
import { fetchKYJpopChart } from "@/lib/crawlers/ky";
import { processCrawledSongs } from "@/lib/crawlers/process";
import type { ProcessResult } from "@/lib/crawlers/process";

import { checkAuth } from "@/utils/auth";
import { getToday } from "@/utils/date";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const today = getToday();

    // TJ 먼저 처리
    const tjSongs = await fetchTJJpopChart();
    const tj = await processCrawledSongs(supabase, tjSongs, "TJ", today);

    // KY는 TJ 다음에 순차 처리해야, TJ가 이번에 만든 song을 KY가 재사용한다.
    // KY 실패가 TJ 결과까지 무효화하지 않도록 KY만 별도 try로 감싼다.
    let ky: ProcessResult | null = null;
    let kyError: string | null = null;
    try {
      const kySongs = await fetchKYJpopChart();
      ky = await processCrawledSongs(supabase, kySongs, "KY", today);
    } catch (e) {
      kyError = String(e);
      console.error("[cron] KY 크롤/적재 실패:", e);
    }

    const failed = tj.failed + (ky?.failed ?? 0);
    const hasFailures = failed > 0 || kyError !== null;

    return Response.json(
      {
        ok: !hasFailures,
        tj,
        ky: ky ?? { error: kyError },
        date: today,
      },
      { status: hasFailures ? 500 : 200 },
    );
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
