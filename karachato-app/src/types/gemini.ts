import type { AiCategory, AiTrait } from "./domain";

// Gemini 프롬프트 응답 타입
export interface TranslateResult {
  title_ko: string;
  title_ko_jp: string;
  title_ko_full: string;
  artist_ko: string;
  description: string;
  ai_category: AiCategory;
  ai_traits: AiTrait[];
  ai_genres: string[];
  ai_vibes: string[];
  ai_vocal_score: number;
  ai_vocal_reason: string;
  ai_pronunciation_score: number;
  ai_pronunciation_reason: string;
  ai_karaoke_tip: string;
}

// 챗봇 유형 정의
export type ChatIntent =
  | { intent: "search_song"; keyword: string; keyword_raw?: string }
  | { intent: "search_artist"; keyword: string; keyword_raw?: string }
  | {
      intent: "recommend";
      artist?: string; // 특정 가수로 한정된 추천 (옵션 좁히기용)
      vibe?: string;
      genre?: string;
      category?: string;
      trait?: string;
      vocal_difficulty?: "easy" | "hard";
      pronunciation_difficulty?: "easy" | "hard";
      // 차트 기반 정렬 모드 — recent_registered: 노래방 신규 등록순(created_at),
      // rank_up/rank_down: 최근 차트 순위 상승/하락순(rank_history)
      chart_sort?: "recent_registered" | "rank_up" | "rank_down";
    }
  | { intent: "unknown" };

// 챗봇 API 응답 타입
export type ChatSongResult = {
  karaoke_no: string;
  provider: string;
  title_ko_jp: string | null;
  title_in_provider: string;
  artist_ko: string | null;
  artist_in_provider: string;
  thumbnail_url: string | null;
};
