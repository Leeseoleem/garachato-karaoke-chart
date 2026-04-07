import { createServerClient } from "@/lib/supabase/server";
import SearchView from "@/components/search/SearchView";
import SearchResultSection from "@/components/search/SearchResultSection";
import type { SearchResult } from "@/types/database";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let results: SearchResult[] = [];

  if (q?.trim()) {
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("search_songs", {
      query: q.trim(),
    });

    if (error) console.error("[search page] RPC error:", error.message);

    // song_id 기준으로 그룹핑
    const grouped = new Map<string, SearchResult>();
    for (const row of data ?? []) {
      if (!grouped.has(row.song_id)) {
        grouped.set(row.song_id, {
          id: row.song_id,
          title_ko: row.title_ko_jp,
          artist_ko: row.artist_ko,
          karaoke_tracks: [],
        });
      }
      grouped.get(row.song_id)!.karaoke_tracks.push({
        karaoke_no: row.karaoke_no,
        provider: row.provider,
        title_in_provider: row.title_in_provider,
        artist_in_provider: row.artist_in_provider,
      });
    }
    results = [...grouped.values()];
  }

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <SearchView initialQuery={q ?? ""} />
      <SearchResultSection results={results} query={q ?? ""} />
    </div>
  );
}
