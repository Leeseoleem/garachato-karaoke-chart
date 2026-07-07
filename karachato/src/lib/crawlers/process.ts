// ============================================================
// lib/crawlers/process.ts
//
// 역할: 크롤러가 가져온 곡 목록(CrawledSong[])을 받아
//       songs / karaoke_tracks / rank_history 세 테이블에 반영하는 공통 파이프라인.
//
// provider(TJ/KY)만 다르고 적재 로직은 동일하므로 한 함수로 묶는다.
// 기존 cron/route.ts의 인라인 TJ 처리 로직을 그대로 옮기고
// provider와 썸네일 처리만 파라미터로 분기했다.
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

// ─────────────────────────────────────────
// processCrawledSongs: 크롤 결과를 DB에 반영
//
// supabase : 서버 클라이언트 (호출자가 만들어 넘김. TJ/KY가 하나를 공유)
// songs    : 크롤로 받은 곡 목록
// provider : "TJ" | "KY" (트랙 필터/삽입, 썸네일 출처 분기에 사용)
// today    : 크롤 기준 날짜 (YYYY-MM-DD)
// ─────────────────────────────────────────
export async function processCrawledSongs(
  supabase: ReturnType<typeof createServerClient>,
  songs: CrawledSong[],
  provider: KaraokeProvider,
  today: string,
): Promise<ProcessResult> {
  // STEP 1. 직전 크롤링 날짜의 rank_history를 Map으로 만들어두기 (delta 계산용)
  const { data: latestDateRow } = await supabase
    .from("rank_history")
    .select("chart_date")
    .lt("chart_date", today)
    .order("chart_date", { ascending: false })
    .limit(1)
    .single();

  const prevRankMap = new Map<number, number>();
  if (latestDateRow) {
    const { data: prevRanks } = await supabase
      .from("rank_history")
      .select("karaoke_track_id, rank")
      .eq("chart_date", latestDateRow.chart_date);

    if (prevRanks) {
      for (const row of prevRanks) {
        prevRankMap.set(row.karaoke_track_id, row.rank);
      }
    }
  }

  // STEP 2. songs 전체 조회 → Map으로 만들어두기 (provider 무관: 같은 곡이면 재사용)
  const { data: existingSongs } = await supabase
    .from("songs")
    .select("id, title_norm, artist_norm");

  const songMap = new Map<string, Song["id"]>();
  if (existingSongs) {
    for (const s of existingSongs) {
      songMap.set(`${s.title_norm}__${s.artist_norm}`, s.id);
    }
  }

  // STEP 3. 이 provider의 karaoke_tracks 조회 → Map으로 만들어두기
  const { data: existingTracks } = await supabase
    .from("karaoke_tracks")
    .select("id, karaoke_no, song_id")
    .eq("provider", provider);

  const trackMap = new Map<string, { id: number; songId: string }>();
  if (existingTracks) {
    for (const t of existingTracks) {
      trackMap.set(t.karaoke_no, { id: t.id, songId: t.song_id });
    }
  }

  const results = await Promise.all(
    songs.map(async (song) => {
      const titleNorm = normalize(song.title);
      const artistNorm = normalize(song.artist);
      const songKey = `${titleNorm}__${artistNorm}`;
      const existingTrack = trackMap.get(song.karaoke_no);

      // songs upsert
      let songId = songMap.get(songKey);

      // 제목 표기가 바뀌어 songKey가 달라져도, 동일 karaoke_no 트랙이 이미
      // 있으면 그 트랙의 song을 재사용한다 (트랙 없는 고아 song 생성 방지)
      if (!songId && existingTrack) {
        songId = existingTrack.songId;
      }

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
        const { data: track, error: trackError } = await supabase
          .from("karaoke_tracks")
          .upsert(
            {
              song_id: songId,
              provider,
              karaoke_no: song.karaoke_no,
              title_in_provider: song.title,
              artist_in_provider: song.artist,
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
