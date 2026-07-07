// 외부 API URL 모음
// constants/api.ts

// === TJ URL ===
export const TJ_BASE_URL = "https://www.tjmedia.com";
export const TJ_CHART_URL = `${TJ_BASE_URL}/chart/top100`;
export const TJ_CHART_API_URL = `${TJ_BASE_URL}/legacy/api/topAndHot100`;

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36";

// === KY URL ===
// 구 도메인 karaokeyou.com은 소멸. 현재 살아있는 kygabang.com이 Node.js fetch로 정상 응답.
export const KY_BASE_URL = "https://kygabang.com";
export const KY_CHART_URL = `${KY_BASE_URL}/chart/new_jpop.php`;

// === YouTube URL ===
export const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
