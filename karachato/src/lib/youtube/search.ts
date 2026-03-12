import { YOUTUBE_API_BASE } from "@/constants/api";

export interface YoutubeSearchResult {
  videoId: string; // 영상 ID
  thumbnailUrl: string; // 썸네일 이미지 URL
}

// query: 검색할 노래에 관한 키워드
export async function searchYoutubeVideo(
  query: string,
): Promise<YoutubeSearchResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("[youtube] YOUTUBE_API_KEY가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "1",
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params.toString()}`);

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`[youtube] API 요청 실패: ${res.status} ${errorBody}`);
  }

  const data = await res.json();
  const item = data.items?.[0];

  if (!item) return null;

  const videoId: string = item.id?.videoId;
  // maxres → high → medium → default 순으로 fallback
  const thumbnailUrl: string =
    item.snippet?.thumbnails?.maxres?.url ??
    item.snippet?.thumbnails?.high?.url ??
    item.snippet?.thumbnails?.medium?.url ??
    item.snippet?.thumbnails?.default?.url;

  if (!videoId || !thumbnailUrl) return null;

  return { videoId, thumbnailUrl };
}
