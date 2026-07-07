// ============================================================
// lib/crawlers/process.ts
//
// 역할: 크롤러가 가져온 곡 목록(CrawledSong[])을 받아
//       songs / karaoke_tracks / rank_history 세 테이블에 반영하는 공통 파이프라인.
//
// provider(TJ/KY)만 다르고 적재 로직은 동일하므로 한 함수로 묶는다.
//
// 같은 곡 판정(중복 song 방지)은 세 단계로 시도한다.
//   1) title_norm + artist_norm 정확 일치 (기존 방식)
//   2) 강화 정규화(괄호/ feat 이후 제거) 일치 (KY의 부제·콜라보 표기차 보정)
//   3) 같은 provider의 동일 karaoke_no 트랙 재사용
// 어느 것도 아니면 새 song을 만든다.
//
// 같은 곡으로 판정되면, KY 트랙의 번역(한글)은 TJ 트랙 값을 공유해 재번역을
// 생략한다. 단 원문 표기(title_in_provider)는 provider별 실제값을 유지해,
// 금영 탭에서는 금영 표기가, TJ 탭에서는 TJ 표기가 보이게 한다.
// ============================================================

import type { CrawledSong } from "@/types/crawler";
import type { Song } from "@/types/database";
import type { KaraokeProvider } from "@/types/domain";
import { createServerClient } from "@/lib/supabase/server";
import { normalize } from "@/utils/string";

// 처리 결과 요약
export interface ProcessResult {
  fetched: number; // 크롤로 받은 곡 수
  processed: number; // 성공 처리된 곡 수
  failed: number; // 실패한 곡 수
}

// 같은 곡의 KY 트랙이 공유할 TJ 번역 (원문은 provider별로 유지하므로 번역만 담는다)
interface TrackTranslation {
  title_ko_jp: string | null;
  title_ko_full: string | null;
  artist_ko: string | null;
}

// ─────────────────────────────────────────
// normalizeForMatch: 같은 곡 판정 전용 강화 정규화
//
// KY는 부제를 "(작품 OP)"로 붙이고(사이트가 25자쯤에서 잘라 괄호가 안 닫히기도 함),
// feat/콜라보 가수를 "가수 feat.X"처럼 괄호 밖에 둔다. 이런 표기차로 같은 곡을
// 놓치지 않도록, 여는 괄호 이후와 feat 이후를 통째로 버린 뒤 정규화한다.
// (전역 normalize는 그대로 두고, 매칭 판정에만 이 함수를 쓴다)
// ─────────────────────────────────────────
function normalizeForMatch(str: string): string {
  return str
    .replace(/[(（][\s\S]*$/, "") // 여는 괄호(반각/전각) 이후 전부 제거 (부제, 잘림 포함)
    .replace(/\s*feat\.?.*$/i, "") // "feat" 이후 제거
    .replace(/\s*featuring.*$/i, "") // "featuring" 이후 제거
    .replace(/[^\w\s぀-ヿ一-鿿가-힣]/g, "") // 특수문자 제거
    .replace(/\s+/g, "") // 공백 제거
    .toLowerCase();
}

// ─────────────────────────────────────────
// processCrawledSongs: 크롤 결과를 DB에 반영
//
// supabase : 서버 클라이언트 (호출자가 만들어 넘김. TJ/KY가 하나를 공유)
// songs    : 크롤로 받은 곡 목록
// provider : "TJ" | "KY" (트랙 필터/삽입, 썸네일 출처, 곡명 따르기 분기에 사용)
// today    : 크롤 기준 날짜 (YYYY-MM-DD)
// ─────────────────────────────────────────
export async function processCrawledSongs(
  supabase: ReturnType<typeof createServerClient>,
  songs: CrawledSong[],
  provider: KaraokeProvider,
  today: string,
): Promise<ProcessResult> {
  // STEP 1. 직전 크롤 날짜의 이 provider rank_history를 Map으로 (delta 계산용)
  // provider별로 스코프해야, KY 첫 크롤 때 어제 TJ 데이터 때문에 전 곡이 잘못
  // "NEW"로 뜨는 것을 막는다(이 provider 데이터가 없으면 UNKNOWN).
  const { data: latestDateRow } = await supabase
    .from("rank_history")
    .select("chart_date, karaoke_tracks!inner(provider)")
    .eq("karaoke_tracks.provider", provider)
    .lt("chart_date", today)
    .order("chart_date", { ascending: false })
    .limit(1)
    .single();

  const prevRankMap = new Map<number, number>();
  if (latestDateRow) {
    const { data: prevRanks } = await supabase
      .from("rank_history")
      .select("karaoke_track_id, rank, karaoke_tracks!inner(provider)")
      .eq("chart_date", latestDateRow.chart_date)
      .eq("karaoke_tracks.provider", provider);

    if (prevRanks) {
      for (const row of prevRanks) {
        prevRankMap.set(row.karaoke_track_id, row.rank);
      }
    }
  }

  // STEP 2. songs 전체 조회 → title_norm+artist_norm 정확 매칭 Map
  const { data: existingSongs } = await supabase
    .from("songs")
    .select("id, title_norm, artist_norm");

  const songMap = new Map<string, Song["id"]>();
  if (existingSongs) {
    for (const s of existingSongs) {
      songMap.set(`${s.title_norm}__${s.artist_norm}`, s.id);
    }
  }

  // STEP 3. karaoke_tracks 전체 조회 → 강화 매칭 Map + TJ 표기 Map + 이 provider 트랙 Map
  const { data: allTracks } = await supabase
    .from("karaoke_tracks")
    .select(
      "id, karaoke_no, song_id, provider, title_in_provider, artist_in_provider, title_ko_jp, title_ko_full, artist_ko",
    );

  const strongMap = new Map<string, string>(); // 강화정규화 키 → song_id
  const tjTrackBySong = new Map<string, TrackTranslation>(); // song_id → TJ 번역 (KY가 공유)
  const trackMap = new Map<string, { id: number; songId: string }>(); // 이 provider의 karaoke_no → 트랙

  if (allTracks) {
    for (const t of allTracks) {
      const strongKey = `${normalizeForMatch(t.title_in_provider)}__${normalizeForMatch(t.artist_in_provider)}`;
      if (!strongMap.has(strongKey)) strongMap.set(strongKey, t.song_id);

      if (t.provider === "TJ" && !tjTrackBySong.has(t.song_id)) {
        tjTrackBySong.set(t.song_id, {
          title_ko_jp: t.title_ko_jp,
          title_ko_full: t.title_ko_full,
          artist_ko: t.artist_ko,
        });
      }

      if (t.provider === provider) {
        trackMap.set(t.karaoke_no, { id: t.id, songId: t.song_id });
      }
    }
  }

  const results = await Promise.all(
    songs.map(async (song) => {
      const titleNorm = normalize(song.title);
      const artistNorm = normalize(song.artist);
      const songKey = `${titleNorm}__${artistNorm}`;
      const existingTrack = trackMap.get(song.karaoke_no);

      // 같은 곡 판정: 정확 매칭 → 강화 매칭 → 동일 karaoke_no 트랙 재사용
      let songId = songMap.get(songKey);

      if (!songId) {
        const strongKey = `${normalizeForMatch(song.title)}__${normalizeForMatch(song.artist)}`;
        songId = strongMap.get(strongKey);
      }

      // 표기가 달라 songKey가 어긋나도, 동일 karaoke_no 트랙이 이미 있으면
      // 그 트랙의 song을 재사용한다 (트랙 없는 고아 song 생성 방지)
      if (!songId && existingTrack) {
        songId = existingTrack.songId;
      }

      // 어느 것에도 안 걸리면 새 song 생성
      if (!songId) {
        // provider별 썸네일: TJ는 앨범 썸네일, KY는 미제공(NONE) → 유튜브 폴백이 채움
        const thumbnailFields =
          provider === "TJ"
            ? {
                thumbnail_url: song.imgthumb_path ?? null,
                thumbnail_source: "TJ" as const,
              }
            : { thumbnail_url: null, thumbnail_source: "NONE" as const };

        const { data: inserted, error: insertError } = await supabase
          .from("songs")
          .insert({
            title_norm: titleNorm,
            artist_norm: artistNorm,
            ai_status: "pending",
            youtube_status: "pending",
            ...thumbnailFields,
          })
          .select("id")
          .single();

        if (insertError?.code === "23505") {
          const { data: conflicted } = await supabase
            .from("songs")
            .select("id")
            .eq("title_norm", titleNorm)
            .eq("artist_norm", artistNorm)
            .single();

          if (!conflicted) {
            console.error(`[crawl] 23505 후 songs 조회 실패: ${song.title}`);
            return false;
          }
          songId = conflicted.id;
        } else if (insertError) {
          console.error(`[crawl] songs INSERT 실패: ${song.title}`, insertError);
          return false;
        } else {
          songId = inserted.id;
        }
      }

      // karaoke_tracks upsert
      let trackId = existingTrack?.id;

      if (!trackId) {
        // 원문 표기는 언제나 이 provider의 실제값을 저장한다(금영 탭=금영 표기).
        // 같은 곡으로 판정됐고 TJ 트랙이 있으면(KY 적재 시) 번역만 TJ 것을 공유해
        // 재번역을 생략한다. 곡번호도 이 provider의 실제값을 쓴다.
        const tjRef = provider !== "TJ" ? tjTrackBySong.get(songId!) : undefined;

        const trackFields = {
          title_in_provider: song.title,
          artist_in_provider: song.artist,
          ...(tjRef
            ? {
                title_ko_jp: tjRef.title_ko_jp,
                title_ko_full: tjRef.title_ko_full,
                artist_ko: tjRef.artist_ko,
              }
            : {}),
        };

        const { data: track, error: trackError } = await supabase
          .from("karaoke_tracks")
          .upsert(
            {
              song_id: songId,
              provider,
              karaoke_no: song.karaoke_no,
              ...trackFields,
            },
            { onConflict: "provider,karaoke_no" },
          )
          .select("id")
          .single();

        if (trackError || !track) {
          const { data: refetchedTrack } = await supabase
            .from("karaoke_tracks")
            .select("id")
            .eq("provider", provider)
            .eq("karaoke_no", song.karaoke_no)
            .single();

          if (!refetchedTrack) {
            console.error(`[crawl] karaoke_tracks id 조회 실패: ${song.title}`);
            return false;
          }
          trackId = refetchedTrack.id;
        } else {
          trackId = track.id;
        }
      }

      // delta 계산
      const prevRank = prevRankMap.get(trackId!);
      let deltaStatus: "NEW" | "UP" | "DOWN" | "SAME" | "UNKNOWN";
      let deltaValue: number | null = null;

      if (prevRank === undefined) {
        deltaStatus = prevRankMap.size === 0 ? "UNKNOWN" : "NEW";
      } else if (prevRank === song.rank) {
        deltaStatus = "SAME";
        deltaValue = 0;
      } else if (prevRank > song.rank) {
        deltaStatus = "UP";
        deltaValue = prevRank - song.rank;
      } else {
        deltaStatus = "DOWN";
        deltaValue = prevRank - song.rank;
      }

      // rank_history upsert
      const { error: rankError } = await supabase.from("rank_history").upsert(
        {
          karaoke_track_id: trackId,
          chart_date: today,
          rank: song.rank,
          delta_status: deltaStatus,
          delta_value: deltaValue,
        },
        {
          onConflict: "karaoke_track_id,chart_date",
          ignoreDuplicates: true,
        },
      );

      if (rankError) {
        console.error(`[crawl] rank_history Upsert 실패: ${song.title}`, rankError);
        return false;
      }

      return true;
    }),
  );

  return {
    fetched: songs.length,
    processed: results.filter(Boolean).length,
    failed: results.filter((r) => !r).length,
  };
}
