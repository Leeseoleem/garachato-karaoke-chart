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
  | { intent: "search_song"; keyword: string }
  | { intent: "search_artist"; keyword: string }
  | { intent: "recommend"; vibe?: string; genre?: string; category?: string }
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

export type ChatResponse =
  | { type: "songs"; songs: ChatSongResult[] }
  | { type: "message"; text: string };
