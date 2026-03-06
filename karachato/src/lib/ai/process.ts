import { createServerClient } from "../supabase/server";
import { translateSongBatch } from "../gemini/translate";
import { normalize } from "@/utils/string";

export const processPendingSongs = async (): Promise<void> => {
  const supabase = createServerClient();

  // limit 없이 전부 가져오기
  const { data: pendingSongs, error } = await supabase
    .from("songs")
    .select("id")
    .eq("ai_status", "pending");

  if (error) {
    console.error("[processPendingSongs] pending 곡 조회 실패", error);
    return;
  }

  if (!pendingSongs || pendingSongs.length === 0) {
    console.log("[processPendingSongs] 처리할 곡 없음");
    return;
  }

  console.log(`[processPendingSongs] 처리 시작 - 총 ${pendingSongs.length}곡`);

  // 10개씩 청크로 나누기
  for (let i = 0; i < pendingSongs.length; i += 10) {
    const chunk = pendingSongs.slice(i, i + 10);

    // 각 song의 karaoke_track 조회
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

    const songIds = chunk.map((s) => s.id);
    const { data: allTracks, error: trackError } = await supabase
      .from("karaoke_tracks")
      .select("id, song_id, provider, title_in_provider, artist_in_provider")
      .in("song_id", songIds);

    if (trackError) {
      console.error(`[processPendingSongs] 트랙 일괄 조회 실패`, trackError);
      continue;
    }

    for (let j = 0; j < chunk.length; j++) {
      const song = chunk[j];

      const tracks = allTracks?.filter((t) => t.song_id === song.id);

      if (!tracks || tracks.length === 0) {
        console.error(`[processPendingSongs] 트랙 없음 - song_id: ${song.id}`);
        continue;
      }

      const firstTrack = tracks[0];
      batchInputs.push({
        index: j,
        songId: song.id,
        trackId: firstTrack.id,
        title: firstTrack.title_in_provider,
        artist: firstTrack.artist_in_provider,
        provider: firstTrack.provider as "TJ" | "KY",
        allTracks: tracks,
      });
    }

    if (batchInputs.length === 0) continue;

    // 10곡 한 번에 Gemini 호출
    const results = await translateSongBatch(
      batchInputs.map((b) => ({
        index: b.index,
        title: b.title,
        artist: b.artist,
        provider: b.provider,
      })),
    );

    // 결과 저장
    for (const input of batchInputs) {
      const result = results[input.index];

      if (!result) {
        console.error(
          `[processPendingSongs] 번역 실패 - song_id: ${input.songId}`,
        );
        continue;
      }

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

      // karaoke_tracks 업데이트
      for (const track of input.allTracks) {
        // title_in_provider가 첫 번째 트랙과 같으면 결과 재사용
        // 다르면 (예: KY 원제가 다른 경우) 별도 배치 호출
        const trackResult =
          track.title_in_provider === input.title
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

        const { error: trackUpdateError } = await supabase
          .from("karaoke_tracks")
          .update({
            title_ko_jp: trackResult.title_ko_jp,
            title_ko_full: trackResult.title_ko_full,
          })
          .eq("id", track.id);

        if (trackUpdateError) {
          console.error(
            `[processPendingSongs] karaoke_tracks 업데이트 실패 - track_id: ${track.id}`,
            trackUpdateError,
          );
        }
      }

      console.log(`[processPendingSongs] 완료 - song_id: ${input.songId}`);
    }

    // 다음 배치 전 10초 대기 (RPM 초과 방지)
    if (i + 10 < pendingSongs.length) {
      console.log(
        `[processPendingSongs] 다음 배치 대기 중... (${i + 10}/${pendingSongs.length})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  console.log("[processPendingSongs] 전체 처리 완료");
};
