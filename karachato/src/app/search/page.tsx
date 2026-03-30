import SearchView from "@/components/search/SearchView";
import SearchResultSection from "@/components/search/SearchResultSection";

import type { SearchResult } from "@/types/database";

// ─── 목업 데이터 ───
export const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: "1",
    title_ko: "아이돌 / IDOL",
    artist_ko: "YOASOBI",
    karaoke_tracks: [
      {
        karaoke_no: "82548",
        provider: "TJ",
        title_in_provider: "アイドル / IDOL",
        artist_in_provider: "YOASOBI",
      },
    ],
  },
  {
    id: "2",
    title_ko: "밤을 달리다",
    artist_ko: "YOASOBI",
    karaoke_tracks: [
      {
        karaoke_no: "82123",
        provider: "TJ",
        title_in_provider: "夜に駆ける",
        artist_in_provider: "YOASOBI",
      },
      {
        karaoke_no: "60345",
        provider: "KY",
        title_in_provider: "夜に駆ける",
        artist_in_provider: "YOASOBI",
      },
    ],
  },
  {
    id: "3",
    title_ko: "귀멸의 칼날",
    artist_ko: "LiSA",
    karaoke_tracks: [
      {
        karaoke_no: "75432",
        provider: "TJ",
        title_in_provider: "紅蓮華",
        artist_in_provider: "LiSA",
      },
    ],
  },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <div className="flex flex-col h-dvh min-h-0">
      <SearchView initialQuery={q ?? ""} />
      <SearchResultSection results={MOCK_SEARCH_RESULTS} />
    </div>
  );
}
