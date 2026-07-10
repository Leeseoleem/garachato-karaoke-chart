import { supabase } from "@/lib/supabase/client";
import type { SearchResult } from "@/types/database";
import type { AiCategory, KaraokeProvider } from "@/types/domain";

// 탐색 캐러셀 카드 1개 (곡 단위)
export interface ExploreItem {
  songId: string;
  title: string; // 표시용(번역 우선)
  artist: string;
  providers: KaraokeProvider[]; // 배지용
  meta?: string; // "2일 전 등록" 등
  isNew?: boolean; // 최근 등록 NEW 배지
  delta?: number; // 순위 상승폭(▲)
}

type SongRow = {
  id: string;
  artist_ko: string | null;
  created_at: string;
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
  id, artist_ko, created_at,
  karaoke_tracks!inner (
    karaoke_no, provider, title_ko_jp,
    title_in_provider, artist_ko, artist_in_provider
  )
`;

// "N일 전" 상대 라벨 (오늘=오늘 등록)
function daysAgoLabel(createdAt: string, now: number): string {
  const diff = Math.floor((now - new Date(createdAt).getTime()) / 86_400_000);
  if (diff <= 0) return "오늘 등록";
  return `${diff}일 전 등록`;
}

function toItem(r: SongRow, now: number): ExploreItem {
  const tracks = r.karaoke_tracks ?? [];
  const primary = tracks.find((t) => t.provider === "TJ") ?? tracks[0];
  const diffDays = Math.floor(
    (now - new Date(r.created_at).getTime()) / 86_400_000,
  );
  return {
    songId: r.id,
    title: primary?.title_ko_jp ?? primary?.title_in_provider ?? "",
    artist: primary?.artist_ko ?? r.artist_ko ?? primary?.artist_in_provider ?? "",
    providers: tracks.map((t) => t.provider as KaraokeProvider),
    meta: daysAgoLabel(r.created_at, now),
    isNew: diffDays <= 3,
  };
}

// 최근 노래방에 등록된 곡 (created_at DESC). category로 좁힐 수 있음.
export async function getRecentSongs(
  category?: AiCategory | null,
  limit = 20,
): Promise<ExploreItem[]> {
  let q = supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("ai_status", "done")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (category) q = q.eq("ai_category", category);

  const { data, error } = await q;
  if (error) {
    console.error("[explore] getRecentSongs error", error.message);
    return [];
  }
  const now = Date.now();
  return ((data ?? []) as unknown as SongRow[]).map((r) => toItem(r, now));
}

// 요즘 순위가 오르는 곡 (최신 차트일, delta_status=UP, 상승폭 순). 곡 단위 dedup.
export async function getRisingSongs(limit = 12): Promise<ExploreItem[]> {
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
        provider,
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
    console.error("[explore] getRisingSongs error", error.message);
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
        primary?.artist_ko ?? song.artist_ko ?? primary?.artist_in_provider ?? "",
      providers: tracks.map((t) => t.provider as KaraokeProvider),
      delta: row.delta_value,
    });
    if (items.length >= limit) break;
  }
  return items;
}

// 카테고리 결과(플랫 리스트)용 — 검색 카드 재사용을 위해 SearchResult 형태로.
export async function getCategorySongs(
  category: AiCategory,
  limit = 50,
): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("ai_status", "done")
    .eq("ai_category", category)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[explore] getCategorySongs error", error.message);
    return [];
  }
  return ((data ?? []) as unknown as SongRow[]).map((r) => {
    const tracks = r.karaoke_tracks ?? [];
    const primary = tracks.find((t) => t.provider === "TJ") ?? tracks[0];
    return {
      id: r.id,
      title_ko: primary?.title_ko_jp ?? primary?.title_in_provider ?? null,
      artist_ko: primary?.artist_ko ?? r.artist_ko,
      karaoke_tracks: tracks.map((t) => ({
        karaoke_no: t.karaoke_no,
        provider:
          t.provider as SearchResult["karaoke_tracks"][number]["provider"],
        title_in_provider: t.title_in_provider,
        artist_in_provider: t.artist_in_provider,
      })),
    };
  });
}
