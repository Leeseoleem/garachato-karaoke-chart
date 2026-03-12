import { createServerClient } from "@/lib/supabase/server";
import { fetchTJJpopChart } from "@/lib/crawlers/tj";
import { processPendingSongs } from "@/lib/ai/process";

// == types ===
import type { Song } from "@/types/database";

// === utils ===
import { getToday } from "@/utils/date";
import { normalize } from "@/utils/string";

// TODO: 배포 전 Vercel 대시보드 Settings → Environment Variables 에 추가 필요
// - CRON_SECRET: 랜덤 문자열 (터미널에서 `openssl rand -base64 32` 로 생성)

export async function GET(request: Request) {
  // 배포 환경에서만 인증 검증
  // CRON_SECRET이 설정된 환경(Vercel)에서만 체크
  // 로컬은 CRON_SECRET이 없으니까 자동으로 통과
  if (process.env.CRON_SECRET) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  try {
    // Secret Key 사용을 위한 클라이언트
    const supabase = createServerClient();
    const today = getToday(); // 오늘 날짜 — rank_history.chart_date에 저장할 값
    const songs = await fetchTJJpopChart();

    let processedCount = 0;

    for (const song of songs) {
      const titleNorm = normalize(song.title);
      const artistNorm = normalize(song.artist);

      const { data: existing, error: existingError } = await supabase
        .from("songs") // songs 테이블에서
        .select("id") // id 컬럼만 가져와
        .eq("title_norm", titleNorm) // title_norm 이 titleNorm 과 같고
        .eq("artist_norm", artistNorm) // artist_norm 이 artistNorm 과 같은 행
        .maybeSingle(); // 결과가 1개면 객체로, 0개면 null로 반환

      if (existingError) {
        console.error(
          `[crawl] songs SELECT 실패: ${song.title}`,
          existingError,
        );
        continue;
      }

      let songId: Song["id"];

      if (existing) {
        songId = existing.id;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("songs")
          .insert({
            title_norm: titleNorm,
            artist_norm: artistNorm,
            ai_status: "pending",
            youtube_status: "pending",
            thumbnail_url: song.imgthumb_path,
            thumbnail_source: "TJ",
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
          songId = conflicted!.id;
        } else if (insertError) {
          console.error(
            `[crawl] songs INSERT 실패: ${song.title}`,
            insertError,
          );
          continue;
        } else {
          songId = inserted.id;
        }
      }
      // STEP 3. karaoke_tracks 테이블 처리
      const { data: track, error: trackError } = await supabase
        .from("karaoke_tracks")
        .upsert(
          {
            song_id: songId,
            provider: "TJ",
            karaoke_no: song.karaoke_no,
            title_in_provider: song.title,
            artist_in_provider: song.artist,
          },
          { onConflict: "provider,karaoke_no" },
        )
        .select("id")
        .single();

      let trackId: number | undefined = track?.id;

      if (trackError || !trackId) {
        const { data: existingTrack, error: existingTrackError } =
          await supabase
            .from("karaoke_tracks")
            .select("id")
            .eq("provider", "TJ")
            .eq("karaoke_no", song.karaoke_no)
            .single();

        if (existingTrackError || !existingTrack) {
          console.error(`[crawl] karaoke_tracks id 조회 실패: ${song.title}`);
          continue;
        }

        trackId = existingTrack.id;
      }

      // STEP 4. rank_history 테이블 처리
      const { error: rankError } = await supabase.from("rank_history").upsert(
        {
          karaoke_track_id: trackId,
          chart_date: today,
          rank: song.rank,
          delta_status: "UNKNOWN",
        },
        {
          onConflict: "karaoke_track_id,chart_date",
        },
      );
      if (rankError) {
        console.error(
          `[crawl] rank_history Upsert 실패: ${song.title}`,
          rankError,
        );
      } else {
        processedCount += 1;
      }
    }
    // STEP 5. AI 번역 처리 (pending 곡만)

    await processPendingSongs();
    return Response.json({
      ok: true,
      fetched: songs.length,
      processed: processedCount,
      date: today,
    });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 }); // ← 추가
  }
}
