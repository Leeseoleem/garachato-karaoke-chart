import { createServerClient } from "@/lib/supabase/server";
import { searchYoutubeVideo } from "@/lib/youtube/search";
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

  // 2. 각 song_id에 대해 karaoke_tracks 원문 조회 (배치). TJ 우선, 없으면 KY로 폴백.
  const { data: tracks, error: tracksError } = await supabase
    .from("karaoke_tracks")
    .select("song_id, provider, title_in_provider, artist_in_provider")
    .in("song_id", songIds)
    .in("provider", ["TJ", "KY"]);

  if (tracksError) {
    console.error("[youtube] karaoke_tracks 조회 실패:", tracksError);
    return;
  }

  // song_id → track 매핑 (TJ 우선, 없으면 KY)
  const trackMap = new Map<
    string,
    { title_in_provider: string; artist_in_provider: string }
  >();
  for (const t of tracks ?? []) {
    const existing = trackMap.get(t.song_id);
    // TJ는 무조건 우선, KY는 아직 없을 때만 채운다
    if (!existing || t.provider === "TJ") {
      trackMap.set(t.song_id, {
        title_in_provider: t.title_in_provider,
        artist_in_provider: t.artist_in_provider,
      });
    }
  }

  let successCount = 0;
  let failCount = 0;

  // 3. 곡별 YouTube 검색 및 업데이트
  for (const song of pendingSongs) {
    const track = trackMap.get(song.id);

    if (!track) {
      console.warn(`[youtube] TJ/KY 트랙 없음, 스킵: song_id=${song.id}`);
      // 트랙이 없는 경우 failed 처리 (무한 pending 방지)
      const { error: updateError } = await supabase
        .from("songs")
        .update({ youtube_status: "failed" })
        .eq("id", song.id);
      if (updateError) {
        console.error(
          `[youtube] 상태 업데이트 실패: song_id=${song.id}`,
          updateError,
        );
      }
      failCount++;
      continue;
    }

    const query = `${track.title_in_provider} ${track.artist_in_provider} official`;

    try {
      const result = await searchYoutubeVideo(query);

      if (!result) {
        console.warn(`[youtube] 검색 결과 없음: ${query}`);
        const { error: updateError } = await supabase
          .from("songs")
          .update({ youtube_status: "failed" })
          .eq("id", song.id);
        if (updateError) {
          console.error(
            `[youtube] 상태 업데이트 실패: song_id=${song.id}`,
            updateError,
          );
        }
        failCount++;
      } else {
        const { error: updateError } = await supabase
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
        if (updateError) {
          console.error(
            `[youtube] 썸네일 업데이트 실패: song_id=${song.id}`,
            updateError,
          );
        } else {
          successCount++;
          console.log(
            `[youtube] 완료: ${track.title_in_provider} → ${result.videoId}`,
          );
        }
      }
    } catch (err) {
      // 할당량 초과 or 타임아웃 → pending 유지 후 루프 중단 (내일 크론 때 자동 재시도)
      if (
        String(err).includes("quotaExceeded") ||
        String(err).includes("타임아웃")
      ) {
        console.warn("[youtube] 일시적 오류, 남은 곡은 내일 재시도:", err);
        break;
      }

      // 그 외 에러는 failed 처리
      console.error(`[youtube] 처리 실패: ${query}`, err);
      const { error: updateError } = await supabase
        .from("songs")
        .update({ youtube_status: "failed" })
        .eq("id", song.id);
      if (updateError) {
        console.error(
          `[youtube] 상태 업데이트 실패: song_id=${song.id}`,
          updateError,
        );
      }
      failCount++;
    }

    await delay(REQUEST_DELAY_MS);
  }

  console.log(
    `[youtube] 처리 완료 — 성공: ${successCount}, 실패: ${failCount}`,
  );
}
