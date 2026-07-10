import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchView from "@/components/search/SearchView";
import SearchResultSection from "@/components/search/SearchResultSection";
import { supabase } from "@/lib/supabase/client";
import type { SearchResult } from "@/types/database";

type SearchRpcRow = {
  song_id: string;
  title_ko_jp: string | null;
  artist_ko: string | null;
  karaoke_no: string;
  provider: string;
  title_in_provider: string;
  artist_in_provider: string;
  is_exact: boolean;
};

// 실제 Supabase search_songs RPC (anon + RLS) 클라 검색. ?q 기반.
export default function Search() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFuzzy, setIsFuzzy] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults([]);
      setIsFuzzy(false);
      return;
    }
    let cancelled = false;
    supabase.rpc("search_songs", { query: q }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("[Search] rpc error", error.message);
        setResults([]);
        setIsFuzzy(false);
        return;
      }
      // song_id 기준 그룹핑하면서 곡별 정확 포함 매칭 여부(is_exact)도 수집
      const grouped = new Map<string, SearchResult>();
      const exactIds = new Set<string>();
      for (const row of (data ?? []) as SearchRpcRow[]) {
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
          provider: row.provider as SearchResult["karaoke_tracks"][number]["provider"],
          title_in_provider: row.title_in_provider,
          artist_in_provider: row.artist_in_provider,
        });
      }
      // 정확 포함 결과가 있으면 그것만, 없으면 유사(퍼지) 결과를 폴백으로 보여준다
      const all = [...grouped.values()];
      const exact = all.filter((r) => exactIds.has(r.id));
      if (exact.length > 0) {
        setResults(exact);
        setIsFuzzy(false);
      } else {
        setResults(all.slice(0, 10));
        setIsFuzzy(all.length > 0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <SearchView initialQuery={q} />
      <SearchResultSection results={results} query={q} isFuzzy={isFuzzy} />
    </div>
  );
}
