import { supabase } from "@/lib/supabase/client";
import type { ChartRow } from "@/types/database";
import type { KaraokeProvider } from "@/types/domain";

// 클라이언트(publishable 키 + RLS) 차트 조회. 기존 서버 getChartByProvider의 클라 버전.
export async function getChartByProvider(provider: KaraokeProvider) {
  // STEP 1. 최신 chart_date
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
  if (!latestDate) return { items: [] as ChartRow[], latestDate: null };

  // STEP 2. 해당 날짜 기준 차트
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
          youtube_video_id,
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
