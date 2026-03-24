import { createServerClient } from "../supabase/server";
import { translateSongBatch } from "../gemini/translate";
import { normalize } from "@/utils/string";

export const processPendingSongs = async (): Promise<void> => {
  const supabase = createServerClient();

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

  for (let i = 0; i < pendingSongs.length; i += 10) {
    const chunk = pendingSongs.slice(i, i + 10);

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

      // [수정 2] TJ 우선, 없으면 KY fallback
      const primaryTrack = tracks.find((t) => t.provider === "TJ") ?? tracks[0];

      batchInputs.push({
        index: j,
        songId: song.id,
        trackId: primaryTrack.id,
        title: primaryTrack.title_in_provider,
        artist: primaryTrack.artist_in_provider,
        provider: primaryTrack.provider as "TJ" | "KY",
        allTracks: tracks,
      });
    }

    if (batchInputs.length === 0) continue;

    const results = await translateSongBatch(
      batchInputs.map((b) => ({
        index: b.index,
        title: b.title,
        artist: b.artist,
        provider: b.provider,
      })),
    );

    for (const input of batchInputs) {
      const result = results[input.index];

      if (!result) {
        console.error(
          `[processPendingSongs] 번역 실패 - song_id: ${input.songId}`,
        );
        continue;
      }

      // [수정 3] track 업데이트 먼저, 성공 후 song 확정
      let allTracksUpdated = true;

      for (const track of input.allTracks) {
        // [수정 1] title + artist 둘 다 같을 때만 결과 재사용
        const trackResult =
          track.title_in_provider === input.title &&
          track.artist_in_provider === input.artist
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
          allTracksUpdated = false;
          continue;
        }

        const { error: trackUpdateError } = await supabase
          .from("karaoke_tracks")
          .update({
            title_ko_jp: trackResult.title_ko_jp,
            title_ko_full: trackResult.title_ko_full,
            artist_ko: trackResult.artist_ko,
          })
          .eq("id", track.id);

        if (trackUpdateError) {
          console.error(
            `[processPendingSongs] karaoke_tracks 업데이트 실패 - track_id: ${track.id}`,
            trackUpdateError,
          );
          allTracksUpdated = false;
        }
      }

      // track 업데이트가 모두 완료된 경우에만 song 확정
      if (!allTracksUpdated) {
        console.error(
          `[processPendingSongs] 일부 트랙 업데이트 실패로 song 확정 스킵 - song_id: ${input.songId}`,
        );
        continue;
      }

      const { error: songUpdateError } = await supabase
        .from("songs")
        .update({
          title_ko: result.title_ko,
          title_ko_norm: normalize(result.title_ko),
          artist_ko: result.artist_ko,
          artist_ko_norm: normalize(result.artist_ko),
          description: result.description,
          ai_category: result.ai_category,
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

      console.log(`[processPendingSongs] 완료 - song_id: ${input.songId}`);
    }

    if (i + 10 < pendingSongs.length) {
      console.log(
        `[processPendingSongs] 다음 배치 대기 중... (${i + 10}/${pendingSongs.length})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  console.log("[processPendingSongs] 전체 처리 완료");
};

// artist_ko가 없는 기존 곡 재처리 (ai_status 변경 없이 artist_ko만 채움)
export const processArtistKo = async (): Promise<void> => {
  const supabase = createServerClient();

  const { data: songs, error } = await supabase
    .from("songs")
    .select("id")
    .eq("ai_status", "done")
    .is("artist_ko", null);

  if (error) {
    console.error("[processArtistKo] 곡 조회 실패", error);
    return;
  }

  if (!songs || songs.length === 0) {
    console.log("[processArtistKo] 처리할 곡 없음");
    return;
  }

  console.log(`[processArtistKo] 처리 시작 - 총 ${songs.length}곡`);

  for (let i = 0; i < songs.length; i += 10) {
    const chunk = songs.slice(i, i + 10);
    const songIds = chunk.map((s) => s.id);

    const { data: allTracks, error: trackError } = await supabase
      .from("karaoke_tracks")
      .select("id, song_id, provider, title_in_provider, artist_in_provider")
      .in("song_id", songIds);

    if (trackError) {
      console.error(`[processArtistKo] 트랙 일괄 조회 실패`, trackError);
      continue;
    }

    const batchInputs: {
      index: number;
      songId: string;
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

    for (let j = 0; j < chunk.length; j++) {
      const song = chunk[j];
      const tracks = allTracks?.filter((t) => t.song_id === song.id);

      if (!tracks || tracks.length === 0) {
        console.error(`[processArtistKo] 트랙 없음 - song_id: ${song.id}`);
        continue;
      }

      // TJ 우선, 없으면 KY
      const primaryTrack = tracks.find((t) => t.provider === "TJ") ?? tracks[0];

      batchInputs.push({
        index: j,
        songId: song.id,
        title: primaryTrack.title_in_provider,
        artist: primaryTrack.artist_in_provider,
        provider: primaryTrack.provider as "TJ" | "KY",
        allTracks: tracks,
      });
    }

    if (batchInputs.length === 0) continue;

    const results = await translateSongBatch(
      batchInputs.map((b) => ({
        index: b.index,
        title: b.title,
        artist: b.artist,
        provider: b.provider,
      })),
    );

    for (const input of batchInputs) {
      const result = results[input.index];

      if (!result) {
        console.error(`[processArtistKo] 번역 실패 - song_id: ${input.songId}`);
        continue;
      }

      // [수정 3] track 업데이트 먼저, 성공 후 song 확정
      let allTracksUpdated = true;

      for (const track of input.allTracks) {
        // [수정 1] title + artist 둘 다 같을 때만 결과 재사용
        const trackResult =
          track.title_in_provider === input.title &&
          track.artist_in_provider === input.artist
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
            `[processArtistKo] 트랙 번역 실패 - track_id: ${track.id}`,
          );
          allTracksUpdated = false;
          continue;
        }

        const { error: trackUpdateError } = await supabase
          .from("karaoke_tracks")
          .update({ artist_ko: trackResult.artist_ko })
          .eq("id", track.id);

        if (trackUpdateError) {
          console.error(
            `[processArtistKo] karaoke_tracks 업데이트 실패 - track_id: ${track.id}`,
            trackUpdateError,
          );
          allTracksUpdated = false;
        }
      }

      // track 업데이트가 모두 완료된 경우에만 song 확정
      if (!allTracksUpdated) {
        console.error(
          `[processArtistKo] 일부 트랙 업데이트 실패로 song 확정 스킵 - song_id: ${input.songId}`,
        );
        continue;
      }

      const { error: songUpdateError } = await supabase
        .from("songs")
        .update({
          artist_ko: result.artist_ko,
          artist_ko_norm: normalize(result.artist_ko),
        })
        .eq("id", input.songId);

      if (songUpdateError) {
        console.error(
          `[processArtistKo] songs 업데이트 실패 - song_id: ${input.songId}`,
          songUpdateError,
        );
        continue;
      }

      console.log(`[processArtistKo] 완료 - song_id: ${input.songId}`);
    }

    if (i + 10 < songs.length) {
      console.log(
        `[processArtistKo] 다음 배치 대기 중... (${i + 10}/${songs.length})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  console.log("[processArtistKo] 전체 처리 완료");
};
