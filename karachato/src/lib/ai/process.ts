import { createServerClient } from "../supabase/server";
import { translateSongBatch } from "../gemini/translate";
import { normalize } from "@/utils/string";

const BATCH_SIZE = 10;

export const processPendingSongs = async (): Promise<void> => {
  const supabase = createServerClient();

  const { data: pendingSongs, error } = await supabase
    .from("songs")
    .select("id")
    .eq("ai_status", "pending")
    .limit(BATCH_SIZE);

  if (error) {
    console.error("[processPendingSongs] pending 곡 조회 실패", error);
    return;
  }

  if (!pendingSongs || pendingSongs.length === 0) {
    console.log("[processPendingSongs] 처리할 곡 없음");
    return;
  }

  console.log(`[processPendingSongs] 처리 시작 - 총 ${pendingSongs.length}곡`);

  // STEP 1. 각 song의 첫 번째 karaoke_track 조회
  const batchInputs: {
    index: number;
    songId: string;
    trackId: number;
    title: string;
    artist: string;
    provider: "TJ" | "KY";
    allTracks: {
      id: number;
      title_in_provider: string;
      artist_in_provider: string;
      provider: string;
    }[];
  }[] = [];

  for (let i = 0; i < pendingSongs.length; i++) {
    const song = pendingSongs[i];

    const { data: tracks, error: trackError } = await supabase
      .from("karaoke_tracks")
      .select("id, provider, title_in_provider, artist_in_provider")
      .eq("song_id", song.id);

    if (trackError || !tracks || tracks.length === 0) {
      console.error(
        `[processPendingSongs] 트랙 조회 실패 - song_id: ${song.id}`,
      );
      continue;
    }

    const firstTrack = tracks[0];
    batchInputs.push({
      index: i,
      songId: song.id,
      trackId: firstTrack.id,
      title: firstTrack.title_in_provider,
      artist: firstTrack.artist_in_provider,
      provider: firstTrack.provider as "TJ" | "KY",
      allTracks: tracks,
    });
  }

  if (batchInputs.length === 0) return;

  // STEP 2. 배치로 Gemini 호출
  const results = await translateSongBatch(
    batchInputs.map((b) => ({
      index: b.index,
      title: b.title,
      artist: b.artist,
      provider: b.provider,
    })),
  );

  // STEP 3. 결과 저장
  for (const input of batchInputs) {
    const result = results[input.index];

    if (!result) {
      // 실패 시 pending 유지 → 다음 Cron에서 재시도
      console.error(
        `[processPendingSongs] 번역 실패 - song_id: ${input.songId}`,
      );
      continue;
    }

    // songs 업데이트
    const { error: songUpdateError } = await supabase
      .from("songs")
      .update({
        title_ko: result.title_ko,
        title_ko_norm: normalize(result.title_ko),
        description: result.description,
        ai_category: result.ai_category,
        ai_category_detail: result.ai_category_detail,
        ai_traits: result.ai_traits,
        ai_genres: result.ai_genres,
        ai_vibes: result.ai_vibes,
        ai_vocal_score: result.ai_vocal_score,
        ai_vocal_reason: result.ai_vocal_reason,
        ai_pronunciation_score: result.ai_pronunciation_score,
        ai_pronunciation_reason: result.ai_pronunciation_reason,
        ai_karaoke_tip: result.ai_karaoke_tip,
        ai_status: "done",
      })
      .eq("id", input.songId);

    if (songUpdateError) {
      console.error(
        `[processPendingSongs] songs 업데이트 실패 - song_id: ${input.songId}`,
      );
      continue;
    }

    // karaoke_tracks 업데이트 (첫 번째 트랙은 결과 재사용, 나머지는 개별 호출)
    for (const track of input.allTracks) {
      const trackResult =
        track.id === input.trackId
          ? result
          : await translateSongBatch([
              {
                index: 0,
                title: track.title_in_provider,
                artist: track.artist_in_provider,
                provider: track.provider as "TJ" | "KY",
              },
            ]).then((r) => r[0]);

      if (!trackResult) {
        console.error(
          `[processPendingSongs] 트랙 번역 실패 - track_id: ${track.id}`,
        );
        continue;
      }

      await supabase
        .from("karaoke_tracks")
        .update({
          title_ko_jp: trackResult.title_ko_jp,
          title_ko_full: trackResult.title_ko_full,
        })
        .eq("id", track.id);
    }

    console.log(`[processPendingSongs] 완료 - song_id: ${input.songId}`);
  }

  console.log("[processPendingSongs] 전체 처리 완료");
};
