// 처리 상태 (ai_status, youtube_status)
export type ProcessStatus = "pending" | "done" | "failed";

// 노래방 제공사 (provider)
export type KaraokeProvider = "TJ" | "KY";

// 썸네일 출처 (thumbnail_source)
export type ThumbnailSource = "TJ" | "YOUTUBE" | "NONE";

// 순위 변동 상태 (delta_status)
export type DeltaStatus =
  | "UP"
  | "DOWN"
  | "SAME"
  | "NEW"
  | "REENTRY"
  | "UNKNOWN";
