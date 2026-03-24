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
