import { createServerClient } from "../supabase/server";
import type { SongDetailRow } from "@/types/database";

export async function getSongByTrackId(
  karaokeTrackId: number,
): Promise<SongDetailRow | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("rank_history")
    .select(
      `
      rank,
      delta_status,
      delta_value,
      chart_date,
      karaoke_tracks!inner (
        id,
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
          description,
          ai_category,
          ai_traits,
          ai_genres,
          ai_vibes,
          ai_vocal_score,
          ai_vocal_reason,
          ai_pronunciation_score,
          ai_pronunciation_reason,
          ai_karaoke_tip
        )
      )
    `,
    )
    .eq("karaoke_track_id", karaokeTrackId)
    .order("chart_date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching song detail:", error);
    throw new Error("Failed to fetch song detail");
  }

  return data as SongDetailRow;
}
