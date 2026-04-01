import { createServerClient } from "../supabase/server";
import type { SongDetailRow } from "@/types/database";

export async function getSongById(
  songId: string,
): Promise<SongDetailRow | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("songs")
    .select(
      `
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
      ai_karaoke_tip,
      karaoke_tracks (
        id,
        karaoke_no,
        provider,
        title_in_provider,
        artist_in_provider,
        title_ko_jp,
        title_ko_full,
        artist_ko,
        rank_history (
          rank,
          delta_status,
          delta_value,
          chart_date
        )
      )
    `,
    )
    .eq("id", songId)
    .eq("ai_status", "done")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching song detail:", error);
    throw new Error("Failed to fetch song detail");
  }

  return data as unknown as SongDetailRow;
}
