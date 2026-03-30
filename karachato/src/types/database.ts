import type {
  ProcessStatus,
  KaraokeProvider,
  ThumbnailSource,
  DeltaStatus,
  AiCategory,
  AiTrait,
} from "./domain";

// ─────────────────────────────────────────
// songs 테이블
// ─────────────────────────────────────────
export interface Song {
  id: string;
  title_norm: string;
  artist_norm: string;
  /** 한글 번역 관련 */
  title_ko: string | null;
  title_ko_norm: string | null;
  artist_ko: string | null;
  artist_ko_norm: string | null;
  description: string | null;

  // AI 분석
  ai_category: AiCategory | null;
  ai_traits: AiTrait[] | null;
  ai_genres: string[] | null;
  ai_vibes: string[] | null;
  ai_vocal_score: number | null;
  ai_vocal_reason: string | null;
  ai_pronunciation_score: number | null;
  ai_pronunciation_reason: string | null;
  ai_karaoke_tip: string | null;
  ai_status: ProcessStatus;

  youtube_video_id: string | null;
  youtube_status: ProcessStatus;

  thumbnail_url: string | null;
  thumbnail_source: ThumbnailSource;
  youtube_thumbnail_url: string | null;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────
// karaoke_tracks 테이블
// ─────────────────────────────────────────
export interface KaraokeTrack {
  id: number;
  song_id: string;
  provider: KaraokeProvider;
  karaoke_no: string;
  title_in_provider: string;
  artist_in_provider: string;
  title_ko_jp: string | null;
  title_ko_full: string | null;
  artist_ko: string | null;
  created_at: string; // TIMESTAMPTZ (ISO string)
  updated_at: string; // TIMESTAMPTZ (ISO string)
}

// ─────────────────────────────────────────
// rank_history 테이블
// ─────────────────────────────────────────
export interface RankHistory {
  id: number; // SERIAL
  karaoke_track_id: number; // INT (FK)
  chart_date: string; // DATE (YYYY-MM-DD)
  rank: number;
  delta_status: DeltaStatus;
  delta_value: number | null;
}

// ─────────────────────────────────────────
// Supabase 조인 결과 타입
// ─────────────────────────────────────────
export interface RankHistoryWithJoin extends RankHistory {
  karaoke_tracks: KaraokeTrack & {
    songs: Song;
  };
}

// ─────────────────────────────────────────
// Supabase 검색 결과 타입
// ─────────────────────────────────────────
export type SearchResult = {
  id: string;
  title_ko: string | null;
  artist_ko: string | null;
  karaoke_tracks: {
    title_ko_jp: string | null; // 일본어만 번역
    title_ko_full: string | null; // 영어까지 번역
    title_in_provider: string; // 원문
    artist_ko: string | null; // 가수명 번역
    artist_in_provider: string; // 가수명 원문
    karaoke_no: string;
    provider: KaraokeProvider;
  }[];
};
