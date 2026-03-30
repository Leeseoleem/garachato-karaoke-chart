import { createServerClient } from "@/lib/supabase/server";
import { fetchTJJpopChart } from "@/lib/crawlers/tj";
import type { Song } from "@/types/database";

import { checkAuth } from "@/utils/auth";
import { getToday } from "@/utils/date";
import { normalize } from "@/utils/string";

export const maxDuration = 60;

export async function GET(request: Request) {
  console.log("CRON_SECRET:", process.env.CRON_SECRET ? "존재함" : "없음");
  if (!checkAuth(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const today = getToday();
    const songs = await fetchTJJpopChart();

    // STEP 1. 직전 크롤링 날짜 조회 후 해당 날짜 rank_history 전체를 Map으로 만들어두기
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

    // STEP 2. songs 전체 조회 → Map으로 만들어두기
    const { data: existingSongs } = await supabase
      .from("songs")
      .select("id, title_norm, artist_norm");

    const songMap = new Map<string, Song["id"]>();
    if (existingSongs) {
      for (const s of existingSongs) {
        songMap.set(`${s.title_norm}__${s.artist_norm}`, s.id);
      }
    }

    // STEP 3. karaoke_tracks 전체 조회 → Map으로 만들어두기
    const { data: existingTracks } = await supabase
      .from("karaoke_tracks")
      .select("id, karaoke_no")
      .eq("provider", "TJ");

    const trackMap = new Map<string, number>();
    if (existingTracks) {
      for (const t of existingTracks) {
        trackMap.set(t.karaoke_no, t.id);
      }
    }

    let processedCount = 0;

    await Promise.all(
      songs.map(async (song) => {
        const titleNorm = normalize(song.title);
        const artistNorm = normalize(song.artist);
        const songKey = `${titleNorm}__${artistNorm}`;

        // songs upsert
        let songId = songMap.get(songKey);

        if (!songId) {
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
            return;
          } else {
            songId = inserted.id;
          }
        }

        // karaoke_tracks upsert
        let trackId = trackMap.get(song.karaoke_no);

        if (!trackId) {
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

          if (trackError || !track) {
            const { data: existingTrack } = await supabase
              .from("karaoke_tracks")
              .select("id")
              .eq("provider", "TJ")
              .eq("karaoke_no", song.karaoke_no)
              .single();

            if (!existingTrack) {
              console.error(
                `[crawl] karaoke_tracks id 조회 실패: ${song.title}`,
              );
              return;
            }
            trackId = existingTrack.id;
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
          console.error(
            `[crawl] rank_history Upsert 실패: ${song.title}`,
            rankError,
          );
        } else {
          processedCount += 1;
        }
      }),
    );

    return Response.json({
      ok: true,
      fetched: songs.length,
      processed: processedCount,
      date: today,
    });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
