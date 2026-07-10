import { createServerClient } from "@/lib/supabase/server";
import type { AiCategory, KaraokeProvider } from "@/types/domain";

// 탐색 캐러셀 카드 1개 (곡 단위, 컴팩트)
export interface ExploreItem {
  songId: string;
  title: string;
  artist: string;
  providers: KaraokeProvider[];
  meta?: string;
  isNew?: boolean;
  delta?: number;
}

// 드릴다운 리스트용 리치 곡 (썸네일 + 설명)
export interface ExploreSong {
  songId: string;
  title: string;
  artist: string;
  description: string | null;
  thumbnailUrl: string | null;
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
  id, artist_ko, created_at, description, thumbnail_url,
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
    thumbnailUrl: r.thumbnail_url,
    tracks: tracks.map((t) => ({
      provider: t.provider as KaraokeProvider,
      karaokeNo: t.karaoke_no,
    })),
  };
}

// 최근 노래방에 등록된 곡 (created_at DESC). category로 좁힐 수 있음. (캐러셀용)
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
  if (category) q = q.eq("ai_category", category);

  const { data, error } = await q;
  if (error) {
    console.error("[explore] getRecentSongs error:", error.message);
    return [];
  }
  const now = Date.now();
  return ((data ?? []) as SongRow[]).map((r) => toItem(r, now));
}

// 요즘 순위가 오르는 곡 (최신 차트일, delta_status=UP, 상승폭 순). 곡 단위 dedup. (캐러셀용)
export async function getRisingSongs(limit = 12): Promise<ExploreItem[]> {
  const supabase = createServerClient();
  const { data: latest } = await supabase
    .from("rank_history")
    .select("chart_date")
    .order("chart_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  const latestDate = latest?.chart_date;
  if (!latestDate) return [];

  const { data, error } = await supabase
    .from("rank_history")
    .select(
      `
      delta_value,
      karaoke_tracks!inner (
        songs!inner (
          id, artist_ko,
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
    delta_value: number;
    karaoke_tracks: {
      songs: {
        id: string;
        artist_ko: string | null;
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
      delta: row.delta_value,
    });
    if (items.length >= limit) break;
  }
  return items;
}

// 카테고리별 곡 (리치 리스트용)
export async function getCategorySongs(
  category: AiCategory,
  limit = 50,
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

// 가수별 둘러보기 목록: 곡 수 많은 순 상위 가수 (artist_norm 그룹핑, artist_ko 표시).
export async function getTopArtists(limit = 12): Promise<ArtistItem[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("songs")
    .select("artist_norm, artist_ko")
    .eq("ai_status", "done")
    .not("artist_ko", "is", null)
    .not("artist_norm", "is", null);
  if (error) {
    console.error("[explore] getTopArtists error:", error.message);
    return [];
  }
  const map = new Map<string, { artistKo: string; count: number }>();
  for (const r of (data ?? []) as {
    artist_norm: string;
    artist_ko: string;
  }[]) {
    const cur = map.get(r.artist_norm);
    if (cur) cur.count += 1;
    else map.set(r.artist_norm, { artistKo: r.artist_ko, count: 1 });
  }
  return [...map.entries()]
    .map(([artistNorm, v]) => ({
      artistNorm,
      artistKo: v.artistKo,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 특정 가수(artist_norm)의 곡 (리치 리스트용)
export async function getArtistSongs(
  artistNorm: string,
  limit = 50,
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
