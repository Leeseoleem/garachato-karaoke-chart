import { createServerClient } from "@/lib/supabase/server";
import {
  CATEGORIES,
  VOCALOID_CHARACTERS,
  RECENT_WINDOW_DAYS,
} from "@/constants/explore";

// 최근 진입 기준 시각(ISO): 지금으로부터 RECENT_WINDOW_DAYS일 전.
const recentCutoffIso = () =>
  new Date(Date.now() - RECENT_WINDOW_DAYS * 86_400_000).toISOString();
import type { AiCategory, KaraokeProvider } from "@/types/domain";

// 캐러셀 카드 (썸네일 미디어 카드)
export interface ExploreItem {
  songId: string;
  title: string;
  artist: string;
  providers: KaraokeProvider[];
  thumbnailUrl: string | null;
  meta?: string;
  isNew?: boolean;
  delta?: number;
  rank?: number;
}

// 드릴다운/상세 리스트용 리치 곡 (썸네일 + 설명 + 필터키)
export interface ExploreSong {
  songId: string;
  title: string;
  artist: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: AiCategory | null;
  characters?: string[];
  tracks: { provider: KaraokeProvider; karaokeNo: string }[];
}

export interface ArtistItem {
  artistNorm: string;
  artistKo: string;
  count: number;
}

type SongRow = {
  id: string;
  artist_ko: string | null;
  created_at: string;
  description: string | null;
  thumbnail_url: string | null;
  ai_category: AiCategory | null;
  karaoke_tracks: {
    karaoke_no: string;
    provider: string;
    title_ko_jp: string | null;
    title_in_provider: string;
    artist_ko: string | null;
    artist_in_provider: string;
  }[];
};

const SONG_SELECT = `
  id, artist_ko, created_at, description, thumbnail_url, ai_category,
  karaoke_tracks!inner (
    karaoke_no, provider, title_ko_jp,
    title_in_provider, artist_ko, artist_in_provider
  )
`;

function primaryOf(r: SongRow) {
  const tracks = r.karaoke_tracks ?? [];
  return {
    tracks,
    primary: tracks.find((t) => t.provider === "TJ") ?? tracks[0],
  };
}

// 유튜브 hqdefault(4:3, 검은 여백) → mqdefault(16:9, 여백 없음)로 표시용 변환
function toThumb(url: string | null): string | null {
  return url ? url.replace("/hqdefault.jpg", "/mqdefault.jpg") : null;
}

function daysAgoLabel(createdAt: string, now: number): string {
  const diff = Math.floor((now - new Date(createdAt).getTime()) / 86_400_000);
  return diff <= 0 ? "오늘 등록" : `${diff}일 전 등록`;
}

function toItem(r: SongRow, now: number): ExploreItem {
  const { tracks, primary } = primaryOf(r);
  const diffDays = Math.floor(
    (now - new Date(r.created_at).getTime()) / 86_400_000,
  );
  return {
    songId: r.id,
    title: primary?.title_ko_jp ?? primary?.title_in_provider ?? "",
    artist:
      primary?.artist_ko ?? r.artist_ko ?? primary?.artist_in_provider ?? "",
    providers: tracks.map((t) => t.provider as KaraokeProvider),
    thumbnailUrl: toThumb(r.thumbnail_url),
    meta: daysAgoLabel(r.created_at, now),
    isNew: diffDays <= 3,
  };
}

function toExploreSong(r: SongRow): ExploreSong {
  const { tracks, primary } = primaryOf(r);
  return {
    songId: r.id,
    title: primary?.title_ko_jp ?? primary?.title_in_provider ?? "",
    artist:
      primary?.artist_ko ?? r.artist_ko ?? primary?.artist_in_provider ?? "",
    description: r.description,
    thumbnailUrl: toThumb(r.thumbnail_url),
    category: r.ai_category,
    tracks: tracks.map((t) => ({
      provider: t.provider as KaraokeProvider,
      karaokeNo: t.karaoke_no,
    })),
  };
}

function matchCharacters(r: SongRow): string[] {
  const found = new Set<string>();
  for (const t of r.karaoke_tracks ?? [])
    for (const c of VOCALOID_CHARACTERS)
      if (c.match.test(t.artist_in_provider)) found.add(c.ko);
  return [...found];
}

// ── 캐러셀용 (컴팩트) ──

export async function getRecentSongs(
  category?: AiCategory | null,
  limit = 20,
): Promise<ExploreItem[]> {
  const supabase = createServerClient();
  let q = supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("ai_status", "done")
    .order("created_at", { ascending: false })
    .limit(limit);
  // 카테고리 지정(보컬로이드 모음 등)은 모음이라 컷 없음. 카테고리 없는 "최근 진입" 섹션만 최근 N일 컷.
  if (category) q = q.eq("ai_category", category);
  else q = q.gte("created_at", recentCutoffIso());
  const { data, error } = await q;
  if (error) {
    console.error("[explore] getRecentSongs error:", error.message);
    return [];
  }
  const now = Date.now();
  return ((data ?? []) as SongRow[]).map((r) => toItem(r, now));
}

export async function getRisingSongs(limit = 12): Promise<ExploreItem[]> {
  const supabase = createServerClient();
  const { data: latest, error: latestError } = await supabase
    .from("rank_history")
    .select("chart_date")
    .order("chart_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) {
    console.error(
      "[explore] getRisingSongs latest date error:",
      latestError.message,
    );
    return [];
  }
  const latestDate = latest?.chart_date;
  if (!latestDate) return [];

  const { data, error } = await supabase
    .from("rank_history")
    .select(
      `
      rank, delta_value,
      karaoke_tracks!inner (
        songs!inner (
          id, artist_ko, thumbnail_url,
          karaoke_tracks ( provider, title_ko_jp, title_in_provider, artist_ko, artist_in_provider )
        )
      )
    `,
    )
    .eq("chart_date", latestDate)
    .eq("delta_status", "UP")
    .order("delta_value", { ascending: false })
    .limit(limit * 2);
  if (error) {
    console.error("[explore] getRisingSongs error:", error.message);
    return [];
  }

  const seen = new Set<string>();
  const items: ExploreItem[] = [];
  for (const row of (data ?? []) as unknown as {
    rank: number;
    delta_value: number;
    karaoke_tracks: {
      songs: {
        id: string;
        artist_ko: string | null;
        thumbnail_url: string | null;
        karaoke_tracks: {
          provider: string;
          title_ko_jp: string | null;
          title_in_provider: string;
          artist_ko: string | null;
          artist_in_provider: string;
        }[];
      };
    };
  }[]) {
    const song = row.karaoke_tracks?.songs;
    if (!song || seen.has(song.id)) continue;
    seen.add(song.id);
    const tracks = song.karaoke_tracks ?? [];
    const primary = tracks.find((t) => t.provider === "TJ") ?? tracks[0];
    items.push({
      songId: song.id,
      title: primary?.title_ko_jp ?? primary?.title_in_provider ?? "",
      artist:
        primary?.artist_ko ??
        song.artist_ko ??
        primary?.artist_in_provider ??
        "",
      providers: tracks.map((t) => t.provider as KaraokeProvider),
      thumbnailUrl: toThumb(song.thumbnail_url),
      delta: row.delta_value,
      rank: row.rank,
    });
    if (items.length >= limit) break;
  }
  return items;
}

// ── 상세 리스트용 (리치) ──

async function fetchRichByIds(ids: string[]): Promise<ExploreSong[]> {
  if (ids.length === 0) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .in("id", ids);
  if (error) {
    console.error("[explore] fetchRichByIds error:", error.message);
    return [];
  }
  const byId = new Map(
    ((data ?? []) as SongRow[]).map((r) => [r.id, toExploreSong(r)]),
  );
  return ids.map((id) => byId.get(id)).filter((s): s is ExploreSong => !!s);
}

export async function getRecentRich(limit = 200): Promise<ExploreSong[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("ai_status", "done")
    .gte("created_at", recentCutoffIso())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[explore] getRecentRich error:", error.message);
    return [];
  }
  return ((data ?? []) as SongRow[]).map(toExploreSong);
}

export async function getRisingRich(limit = 60): Promise<ExploreSong[]> {
  const rising = await getRisingSongs(limit);
  return fetchRichByIds(rising.map((r) => r.songId));
}

export async function getVocaloidRich(): Promise<ExploreSong[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("ai_status", "done")
    .eq("ai_category", "보컬로이드")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[explore] getVocaloidRich error:", error.message);
    return [];
  }
  return ((data ?? []) as SongRow[]).map((r) => ({
    ...toExploreSong(r),
    characters: matchCharacters(r),
  }));
}

export async function getCategorySongs(
  category: AiCategory,
  limit = 100,
): Promise<ExploreSong[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("ai_status", "done")
    .eq("ai_category", category)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[explore] getCategorySongs error:", error.message);
    return [];
  }
  return ((data ?? []) as SongRow[]).map(toExploreSong);
}

export async function getArtistSongs(
  artistNorm: string,
  limit = 100,
): Promise<ExploreSong[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("ai_status", "done")
    .eq("artist_norm", artistNorm)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[explore] getArtistSongs error:", error.message);
    return [];
  }
  return ((data ?? []) as SongRow[]).map(toExploreSong);
}

// 가수별 둘러보기 목록 (곡 수 순). DB 집계 RPC로 처리(1000행 캡 회피).
export async function getTopArtists(limit = 100): Promise<ArtistItem[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase.rpc("explore_top_artists", {
    limit_count: limit,
  });
  if (error) {
    console.error("[explore] getTopArtists error:", error.message);
    return [];
  }
  return (
    (data ?? []) as {
      artist_norm: string;
      artist_ko: string;
      song_count: number;
    }[]
  ).map((r) => ({
    artistNorm: r.artist_norm,
    artistKo: r.artist_ko,
    count: Number(r.song_count),
  }));
}

// 실제로 곡이 하나 이상 있는 카테고리만 (CATEGORIES 순서 유지). 빈 카테고리는 숨긴다.
export async function getAvailableCategories(): Promise<AiCategory[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase.rpc("explore_category_counts");
  if (error) {
    console.error("[explore] getAvailableCategories error:", error.message);
    return [];
  }
  const present = new Set(
    ((data ?? []) as { ai_category: AiCategory }[]).map((r) => r.ai_category),
  );
  return CATEGORIES.filter((c) => present.has(c));
}
