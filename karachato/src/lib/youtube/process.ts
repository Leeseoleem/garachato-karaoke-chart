import { createServerClient } from "../supabase/server";
import { searchYoutubeVideo } from "./search";
import { delay } from "@/utils/delay";

const DAILY_LIMIT = 80; // YouTube API 일일 할당량 보호 (100 유닛/건 × 80 = 8,000 유닛)
const REQUEST_DELAY_MS = 200; // 요청 사이 딜레이 (ms)

/**
 * youtube_status = 'pending' 인 곡들을 대상으로
 * YouTube 검색 후 video_id / thumbnail_url 업데이트
 *
 * 처리 우선순위: karaoke_tracks TJ 기준 원문 제목/가수명으로 검색
 * 썸네일 교체: thumbnail_source = 'TJ' → 'YOUTUBE' 로 업그레이드
 */
export async function processPendingYoutube(): Promise<void> {
  const supabase = createServerClient();

  // 1. youtube_status = 'pending' 곡 조회 (DAILY_LIMIT 만큼만)
  const { data: pendingSongs, error: fetchError } = await supabase
    .from("songs")
    .select("id")
    .eq("youtube_status", "pending")
    .limit(DAILY_LIMIT);

  if (fetchError) {
    console.error("[youtube] pending 곡 조회 실패:", fetchError);
    return;
  }

  if (!pendingSongs || pendingSongs.length === 0) {
    console.log("[youtube] 처리할 pending 곡 없음");
    return;
  }

  console.log(`[youtube] 처리 시작: ${pendingSongs.length}곡`);

  const songIds = pendingSongs.map((s) => s.id);

  // 2. 각 song_id에 대해 TJ 기준 karaoke_tracks 원문 조회 (배치)
  // TODO: feat/crawler-ky 작업 시 TJ 없으면 KY로 fallback 처리 추가
  //   .in("provider", ["TJ", "KY"]) 로 변경 후
  //   const track = tracks.find(t => t.provider === "TJ") ?? tracks.find(t => t.provider === "KY");
  const { data: tracks, error: tracksError } = await supabase
    .from("karaoke_tracks")
    .select("song_id, title_in_provider, artist_in_provider")
    .in("song_id", songIds)
    .eq("provider", "TJ");

  if (tracksError) {
    console.error("[youtube] karaoke_tracks 조회 실패:", tracksError);
    return;
  }

  // song_id → track 매핑
  const trackMap = new Map((tracks ?? []).map((t) => [t.song_id, t]));

  let successCount = 0;
  let failCount = 0;

  // 3. 곡별 YouTube 검색 및 업데이트
  for (const song of pendingSongs) {
    const track = trackMap.get(song.id);

    if (!track) {
      console.warn(`[youtube] TJ 트랙 없음, 스킵: song_id=${song.id}`);
      // TJ 트랙이 없는 경우 failed 처리 (무한 pending 방지)
      await supabase
        .from("songs")
        .update({ youtube_status: "failed" })
        .eq("id", song.id);
      failCount++;
      continue;
    }

    const query = `${track.title_in_provider} ${track.artist_in_provider} official`;

    try {
      const result = await searchYoutubeVideo(query);

      if (!result) {
        console.warn(`[youtube] 검색 결과 없음: ${query}`);
        await supabase
          .from("songs")
          .update({ youtube_status: "failed" })
          .eq("id", song.id);
        failCount++;
      } else {
        await supabase
          .from("songs")
          .update({
            youtube_video_id: result.videoId,
            youtube_thumbnail_url: result.thumbnailUrl,
            youtube_status: "done",
            // TJ 썸네일 → YOUTUBE 썸네일로 업그레이드
            thumbnail_url: result.thumbnailUrl,
            thumbnail_source: "YOUTUBE",
          })
          .eq("id", song.id);

        successCount++;
        console.log(
          `[youtube] 완료: ${track.title_in_provider} → ${result.videoId}`,
        );
      }
    } catch (err) {
      console.error(`[youtube] 처리 실패: ${query}`, err);
      await supabase
        .from("songs")
        .update({ youtube_status: "failed" })
        .eq("id", song.id);
      failCount++;
    }

    await delay(REQUEST_DELAY_MS);
  }

  console.log(
    `[youtube] 처리 완료 — 성공: ${successCount}, 실패: ${failCount}`,
  );
}
