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
  let isFuzzy = false;

  if (q?.trim()) {
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("search_songs", {
      query: q.trim(),
    });

    if (error) console.error("[search page] RPC error:", error.message);

    // song_id 기준으로 그룹핑하면서 곡별 정확 포함 매칭 여부(is_exact)도 수집
    const grouped = new Map<string, SearchResult>();
    const exactIds = new Set<string>();
    for (const row of data ?? []) {
      if (row.is_exact) exactIds.add(row.song_id);
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

    // 정확 포함 결과가 하나라도 있으면 그것만 보여주고, 없을 때만 유사(퍼지) 결과를 폴백으로 보여준다
    const all = [...grouped.values()];
    const exact = all.filter((r) => exactIds.has(r.id));
    if (exact.length > 0) {
      results = exact;
    } else {
      results = all.slice(0, 10);
      isFuzzy = all.length > 0;
    }
  }

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <SearchView initialQuery={q ?? ""} />
      <SearchResultSection results={results} query={q ?? ""} isFuzzy={isFuzzy} />
    </div>
  );
}
