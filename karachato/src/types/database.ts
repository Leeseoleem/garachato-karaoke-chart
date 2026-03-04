import type {
  ProcessStatus,
  KaraokeProvider,
  ThumbnailSource,
  DeltaStatus,
} from "./domain";

// ─────────────────────────────────────────
// songs 테이블
// ─────────────────────────────────────────
export interface Song {
  id: string;
  title_norm: string;
  artist_norm: string;
  title_ko: string | null;
  description: string | null;
  ai_tags: string[] | null;
  ai_status: ProcessStatus;

  youtube_video_id: string | null;
  youtube_status: ProcessStatus;

  thumbnail_url: string | null;
  thumbnail_source: ThumbnailSource;
  youtube_thumbnail_url: string | null;

  created_at: string; // TIMESTAMPTZ (ISO string)
  updated_at: string; // TIMESTAMPTZ (ISO string)
}

// ─────────────────────────────────────────
// karaoke_tracks 테이블
// ─────────────────────────────────────────
export interface KaraokeTrack {
  id: number; // SERIAL
  song_id: string; // UUID
  provider: KaraokeProvider;
  karaoke_no: string;
  title_in_provider: string;
  artist_in_provider: string;
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
  collected_at: string; // TIMESTAMPTZ (ISO string)
}
