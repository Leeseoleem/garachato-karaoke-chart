import { createServerClient } from "../supabase/server";
import type { ChartRow } from "@/types/database";
import type { KaraokeProvider } from "@/types/domain";

export async function getChartByProvider(provider: KaraokeProvider) {
  const supabase = await createServerClient();

  // STEP 1. 최신 chart_date 조회
  const { data: latest, error: latestError } = await supabase
    .from("rank_history")
    .select("chart_date")
    .order("chart_date", { ascending: false })
    .limit(1)
    .single();

  if (latestError && latestError.code !== "PGRST116") {
    console.error("Error fetching latest chart date:", latestError);
    throw new Error("Failed to fetch latest chart date");
  }

  const latestDate = latest?.chart_date ?? null;

  if (!latestDate) return { items: [], latestDate: null };

  // STEP 2. 해당 날짜 기준 차트 조회
  const { data, error } = await supabase
    .from("rank_history")
    .select(
      `
      karaoke_track_id,
      rank,
      delta_status,
      delta_value,
      chart_date,
      karaoke_tracks!inner (
        karaoke_no,
        title_in_provider,
        artist_in_provider,
        title_ko_jp,
        title_ko_full,
        artist_ko,
        provider,
        songs!inner (
          id,
          title_ko,
          artist_ko,
          thumbnail_url,
          ai_category,
          ai_genres,
          ai_vibes
        )
      )
    `,
    )
    .eq("chart_date", latestDate)
    .eq("karaoke_tracks.provider", provider)
    .order("rank", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Error fetching chart data:", error);
    throw new Error("Failed to fetch chart data");
  }

  return { items: (data as unknown as ChartRow[]) ?? [], latestDate };
}
