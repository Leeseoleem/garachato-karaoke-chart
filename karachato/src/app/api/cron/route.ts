import { createServerClient } from "@/lib/supabase/server";
import { fetchTJJpopChart } from "@/lib/crawlers/tj";
import { processCrawledSongs } from "@/lib/crawlers/process";

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

    const songs = await fetchTJJpopChart();
    const tj = await processCrawledSongs(supabase, songs, "TJ", today);

    const hasFailures = tj.failed > 0;

    return Response.json(
      {
        ok: !hasFailures,
        fetched: tj.fetched,
        processed: tj.processed,
        failed: tj.failed,
        date: today,
      },
      { status: hasFailures ? 500 : 200 },
    );
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
