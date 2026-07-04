// 처리 상태 (ai_status, youtube_status)
export type ProcessStatus = "pending" | "done" | "failed";

// 노래방 제공사 (provider)
export type KaraokeProvider = "TJ" | "KY";

// 썸네일 출처 (thumbnail_source)
export type ThumbnailSource = "TJ" | "YOUTUBE" | "NONE";

// 순위 변동 상태 (delta_status)
export type DeltaStatus = "UP" | "DOWN" | "SAME" | "NEW" | "UNKNOWN";

// AI 카테고리 (ai_category)
export type AiCategory =
  | "애니메이션 OST"
  | "극장판 OST"
  | "게임 OST"
  | "보컬로이드"
  | "J-POP";

// AI 트레잇 (ai_traits)
export type AiTrait = "역주행" | "바이럴" | "최신곡" | "예전곡" | "커버곡";
