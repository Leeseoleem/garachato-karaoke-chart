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
  vocal_gender?: "남성" | "여성" | "혼성" | "불명"; // 리드보컬 성별 (AI 유추)
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
      // 보컬 속성 태그 (곡의 songs.vocal_tags와 교집합 필터). 예: 여성, 보컬로이드, 파란머리, 대파
      vocal_tags?: string[];
    }
  // 유사 후보 선택지에서 사용자가 특정 곡을 고른 경우 (클라가 옵션 intent로 되돌려 보냄)
  | { intent: "pick_song"; song_id: string }
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
