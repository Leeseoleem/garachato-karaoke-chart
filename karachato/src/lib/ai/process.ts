import { createServerClient } from "../supabase/server";
import { translateSongBatch } from "../gemini/translate";
import { generateSongIntro } from "../gemini/describe";
import { normalize } from "@/utils/string";
import { deriveVocalTags } from "@/constants/vocaloid";

// 같은 가수(artist_norm)의 기존 곡에서 성별 태그(여성/남성)를 재사용 → 신규 곡 성별 자동 채움.
// (보컬로이드는 하드코딩 맵으로, 사람 성별은 이 재사용으로. 완전 신규 가수는 null → 이후 수동/AI 보강.)
async function reuseGenderTags(
  supabase: ReturnType<typeof createServerClient>,
  artistNorm: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("songs")
    .select("vocal_tags")
    .eq("artist_norm", artistNorm)
    .not("vocal_tags", "is", null)
    .limit(20);
  const genders = new Set<string>();
  for (const row of data ?? [])
    for (const t of (row.vocal_tags ?? []) as string[])
      if (t === "여성" || t === "남성") genders.add(t);
  return [...genders];
}

// AI가 유추한 리드보컬 성별을 태그로. 불명/누락은 빈 배열(억지로 안 붙임).
function aiGenderToTags(g: string | undefined | null): string[] {
  if (g === "남성") return ["남성"];
  if (g === "여성") return ["여성"];
  if (g === "혼성") return ["여성", "남성"];
  return [];
}

// 같은 원문 가수명(artist_in_provider)에 이미 확정된 번역명이 있으면 재사용해 표기 흔들림을 막는다.
// 피처링 변형은 원문 자체가 달라(예: "米津玄師" vs "米津玄師(+菅田将暉)") 자연히 구분된다.
// LLM이 매번 새로 번역해 흔들리던 것을 결정적으로 고정(ISSUE-06).
async function buildArtistKoMap(
  supabase: ReturnType<typeof createServerClient>,
): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("karaoke_tracks")
    .select("artist_in_provider, artist_ko")
    .not("artist_ko", "is", null);
  // 원문별 번역명 빈도 집계 → 최빈값 채택(데이터 정리 후엔 유일값이라 그대로 확정됨)
  const tally = new Map<string, Map<string, number>>();
  for (const r of (data ?? []) as {
    artist_in_provider: string;
    artist_ko: string | null;
  }[]) {
    if (!r.artist_in_provider || !r.artist_ko) continue;
    const counts = tally.get(r.artist_in_provider) ?? new Map<string, number>();
    counts.set(r.artist_ko, (counts.get(r.artist_ko) ?? 0) + 1);
    tally.set(r.artist_in_provider, counts);
  }
  const map = new Map<string, string>();
  for (const [prov, counts] of tally) {
    let best = "";
    let bestN = -1;
    for (const [ko, n] of counts)
      if (n > bestN) {
        best = ko;
        bestN = n;
      }
    if (best) map.set(prov, best);
  }
  return map;
}

export const processPendingSongs = async (
  deadline?: number,
): Promise<void> => {
  const supabase = createServerClient();

  const { data: pendingSongs, error } = await supabase
    .from("songs")
    .select("id, artist_norm")
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

  // 기존 확정 가수명 재사용 맵(원문 → 번역명). 신규 곡은 아래에서 채워 런 내 일관성도 유지.
  const artistKoMap = await buildArtistKoMap(supabase);

  for (let i = 0; i < pendingSongs.length; i += 10) {
    // 시간 예산 초과 시 진행분만 커밋된 상태로 종료 (나머지 pending은 다음 실행이 이어받음)
    if (deadline !== undefined && Date.now() >= deadline) {
      console.log(
        `[processPendingSongs] 시간 예산 초과 - ${i}/${pendingSongs.length}곡까지 처리, 나머지는 다음 실행으로 이월`,
      );
      return;
    }

    const chunk = pendingSongs.slice(i, i + 10);

    const batchInputs: {
      index: number;
      songId: string;
      artistNorm: string;
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

      // TJ 우선, 없으면 KY fallback
      const primaryTrack = tracks.find((t) => t.provider === "TJ") ?? tracks[0];

      batchInputs.push({
        index: j,
        songId: song.id,
        artistNorm: song.artist_norm,
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

    for (let k = 0; k < batchInputs.length; k++) {
      // 곡 단위 시간 예산 체크 (한 청크가 60s를 넘길 수 있어 곡마다 확인)
      if (deadline !== undefined && Date.now() >= deadline) {
        console.log(
          "[processPendingSongs] 시간 예산 초과 - 남은 곡은 다음 실행으로 이월",
        );
        return;
      }

      const input = batchInputs[k];
      const result = results[k];

      if (!result) {
        console.error(
          `[processPendingSongs] 번역 실패 - song_id: ${input.songId}`,
        );
        continue;
      }

      // 불일치 트랙 수집 후 배치 번역
      const unmatchedTracks = input.allTracks.filter(
        (t) =>
          t.title_in_provider !== input.title ||
          t.artist_in_provider !== input.artist,
      );

      const unmatchedResults =
        unmatchedTracks.length > 0
          ? await translateSongBatch(
              unmatchedTracks.map((t, idx) => ({
                index: idx,
                title: t.title_in_provider,
                artist: t.artist_in_provider,
                provider: t.provider as "TJ" | "KY",
              })),
            )
          : [];

      // track 업데이트 먼저, 성공 후 song 확정
      let allTracksUpdated = true;

      for (const track of input.allTracks) {
        const isMatched =
          track.title_in_provider === input.title &&
          track.artist_in_provider === input.artist;

        const trackResult = isMatched
          ? result
          : unmatchedResults[
              unmatchedTracks.findIndex((t) => t.id === track.id)
            ];

        if (!trackResult) {
          console.error(
            `[processPendingSongs] 트랙 번역 실패 - track_id: ${track.id}`,
          );
          allTracksUpdated = false;
          continue;
        }

        // 기존 확정 표기가 있으면 그대로, 없으면 신규 번역을 확정값으로 등록(런 내 후속 곡도 동일)
        const trackArtistKo =
          artistKoMap.get(track.artist_in_provider) ?? trackResult.artist_ko;
        artistKoMap.set(track.artist_in_provider, trackArtistKo);

        const { error: trackUpdateError } = await supabase
          .from("karaoke_tracks")
          .update({
            title_ko_jp: trackResult.title_ko_jp,
            title_ko_full: trackResult.title_ko_full,
            artist_ko: trackArtistKo,
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

      if (!allTracksUpdated) {
        console.error(
          `[processPendingSongs] 일부 트랙 업데이트 실패로 song 확정 스킵 - song_id: ${input.songId}`,
        );
        continue;
      }

      // 보컬 속성: 보컬로이드(캐릭터 맵) + 사람 성별을 합집합으로.
      // 성별은 같은 가수 기존 곡 재사용 우선 → 없으면 (보컬로이드는 맵이 담당) AI 유추.
      const vocaloidTags =
        deriveVocalTags(input.allTracks.map((t) => t.artist_in_provider)) ?? [];
      const reusedGender = await reuseGenderTags(supabase, input.artistNorm);
      const genderTags =
        reusedGender.length > 0
          ? reusedGender
          : vocaloidTags.length > 0
            ? []
            : aiGenderToTags(result.vocal_gender);
      const vocalTags = [...new Set([...vocaloidTags, ...genderTags])];

      // 곡의 대표 가수명도 트랙과 동일 확정값 사용(위 트랙 루프에서 primary 원문이 맵에 등록됨)
      const songArtistKo = artistKoMap.get(input.artist) ?? result.artist_ko;

      const { error: songUpdateError } = await supabase
        .from("songs")
        .update({
          title_ko: result.title_ko,
          title_ko_norm: normalize(result.title_ko),
          artist_ko: songArtistKo,
          artist_ko_norm: normalize(songArtistKo),
          // 인트로(구글 검색, 무거움)는 done 경로에서 분리 → 번역 결과 설명으로 우선 채우고
          // 리치 설명·사실 리스트는 backfillSongIntros가 남는 예산에 뒤따라 채운다.
          description: result.description,
          ai_intro: null,
          vocal_tags: vocalTags.length > 0 ? vocalTags : null,
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

  }

  console.log("[processPendingSongs] 전체 처리 완료");
};

// done인데 리치 인트로(ai_intro)가 없는 곡에 구글 검색 기반 소개를 채운다(신규 우선).
// 곡당 그라운딩 호출이 무거워 남는 예산에서 몇 곡씩 뒤따라 처리된다.
export const backfillSongIntros = async (
  deadline?: number,
): Promise<void> => {
  const supabase = createServerClient();

  const { data: songs, error } = await supabase
    .from("songs")
    .select(
      `id, ai_category,
       karaoke_tracks!inner ( provider, title_in_provider, artist_in_provider )`,
    )
    .eq("ai_status", "done")
    .is("ai_intro", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[backfillSongIntros] 곡 조회 실패", error);
    return;
  }
  if (!songs || songs.length === 0) {
    console.log("[backfillSongIntros] 채울 곡 없음");
    return;
  }

  console.log(`[backfillSongIntros] 대상 ${songs.length}곡`);

  for (const song of songs as unknown as {
    id: string;
    ai_category: string | null;
    karaoke_tracks: {
      provider: string;
      title_in_provider: string;
      artist_in_provider: string;
    }[];
  }[]) {
    if (deadline !== undefined && Date.now() >= deadline) {
      console.log("[backfillSongIntros] 시간 예산 초과 - 나머지는 다음 실행으로 이월");
      return;
    }

    const tracks = song.karaoke_tracks ?? [];
    const primary = tracks.find((t) => t.provider === "TJ") ?? tracks[0];
    if (!primary) continue;

    const intro = await generateSongIntro(
      primary.title_in_provider,
      primary.artist_in_provider,
      song.ai_category ?? "",
    );
    if (!intro) {
      // 실패 시 이번엔 건너뛰고 다음 실행에서 재시도
      console.error(`[backfillSongIntros] 인트로 생성 실패 - song_id: ${song.id}`);
      continue;
    }

    const { error: upError } = await supabase
      .from("songs")
      .update({ description: intro.description, ai_intro: intro.facts })
      .eq("id", song.id);

    if (upError) {
      console.error(
        `[backfillSongIntros] songs 업데이트 실패 - song_id: ${song.id}`,
        upError,
      );
      continue;
    }
    console.log(`[backfillSongIntros] 완료 - song_id: ${song.id}`);
  }

  console.log("[backfillSongIntros] 전체 처리 완료");
};

// artist_ko가 없는 기존 곡 재처리 (ai_status 변경 없이 artist_ko만 채움)
export const processArtistKo = async (
  deadline?: number,
): Promise<void> => {
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

  // 기존 확정 가수명 재사용 맵(원문 → 번역명)
  const artistKoMap = await buildArtistKoMap(supabase);

  for (let i = 0; i < songs.length; i += 10) {
    if (deadline !== undefined && Date.now() >= deadline) {
      console.log(
        `[processArtistKo] 시간 예산 초과 - ${i}/${songs.length}곡까지 처리, 나머지는 다음 실행으로 이월`,
      );
      return;
    }

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

    for (let k = 0; k < batchInputs.length; k++) {
      if (deadline !== undefined && Date.now() >= deadline) {
        console.log(
          "[processArtistKo] 시간 예산 초과 - 남은 곡은 다음 실행으로 이월",
        );
        return;
      }

      const input = batchInputs[k];
      const result = results[k];

      if (!result) {
        console.error(`[processArtistKo] 번역 실패 - song_id: ${input.songId}`);
        continue;
      }

      // 불일치 트랙 수집 후 배치 번역
      const unmatchedTracks = input.allTracks.filter(
        (t) =>
          t.title_in_provider !== input.title ||
          t.artist_in_provider !== input.artist,
      );

      const unmatchedResults =
        unmatchedTracks.length > 0
          ? await translateSongBatch(
              unmatchedTracks.map((t, idx) => ({
                index: idx,
                title: t.title_in_provider,
                artist: t.artist_in_provider,
                provider: t.provider as "TJ" | "KY",
              })),
            )
          : [];

      // track 업데이트 먼저, 성공 후 song 확정
      let allTracksUpdated = true;

      for (const track of input.allTracks) {
        const isMatched =
          track.title_in_provider === input.title &&
          track.artist_in_provider === input.artist;

        const trackResult = isMatched
          ? result
          : unmatchedResults[
              unmatchedTracks.findIndex((t) => t.id === track.id)
            ];

        if (!trackResult) {
          console.error(
            `[processArtistKo] 트랙 번역 실패 - track_id: ${track.id}`,
          );
          allTracksUpdated = false;
          continue;
        }

        const trackArtistKo =
          artistKoMap.get(track.artist_in_provider) ?? trackResult.artist_ko;
        artistKoMap.set(track.artist_in_provider, trackArtistKo);

        const { error: trackUpdateError } = await supabase
          .from("karaoke_tracks")
          .update({ artist_ko: trackArtistKo })
          .eq("id", track.id);

        if (trackUpdateError) {
          console.error(
            `[processArtistKo] karaoke_tracks 업데이트 실패 - track_id: ${track.id}`,
            trackUpdateError,
          );
          allTracksUpdated = false;
        }
      }

      if (!allTracksUpdated) {
        console.error(
          `[processArtistKo] 일부 트랙 업데이트 실패로 song 확정 스킵 - song_id: ${input.songId}`,
        );
        continue;
      }

      const songArtistKo = artistKoMap.get(input.artist) ?? result.artist_ko;

      const { error: songUpdateError } = await supabase
        .from("songs")
        .update({
          artist_ko: songArtistKo,
          artist_ko_norm: normalize(songArtistKo),
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

  }

  console.log("[processArtistKo] 전체 처리 완료");
};
