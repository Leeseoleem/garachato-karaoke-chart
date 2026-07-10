import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Compass } from "lucide-react";
import DetailHeader from "@/components/common/headers/DetailHeader";
import CategoryChips from "@/components/explore/CategoryChips";
import ExploreCarousel from "@/components/explore/ExploreCarousel";
import ArtistList from "@/components/explore/ArtistList";
import SearchResultItem from "@/components/search/SearchResultItem";
import { CATEGORIES } from "@/constants/explore";
import {
  getRecentSongs,
  getRisingSongs,
  getCategorySongs,
  getTopArtists,
  getArtistSongs,
  type ExploreItem,
  type ArtistItem,
} from "@/lib/explore/queries";
import type { SearchResult } from "@/types/database";
import type { AiCategory } from "@/types/domain";

// 탐색: 큐레이션 캐러셀 홈(최근등록·순위상승·보컬로이드) + 카테고리 필터 + 가수별.
// ?category → 그 카테고리 리스트, ?artist → 그 가수 곡 리스트. (더보기는 후속)
export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const artistNorm = searchParams.get("artist");
  const categoryParam = searchParams.get("category");
  const category: AiCategory | null =
    CATEGORIES.find((c) => c === categoryParam) ?? null;

  const setCategory = (next: AiCategory | null) =>
    setSearchParams(next ? { category: next } : {});

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <DetailHeader title="탐색" />
      {artistNorm ? (
        <ArtistView artistNorm={artistNorm} />
      ) : (
        <>
          <CategoryChips active={category} onChange={setCategory} />
          <div className="flex-1 overflow-y-auto pb-6">
            {category ? <CategoryList category={category} /> : <CurationHome />}
          </div>
        </>
      )}
    </div>
  );
}

function CurationHome() {
  const [recent, setRecent] = useState<ExploreItem[]>([]);
  const [rising, setRising] = useState<ExploreItem[]>([]);
  const [vocaloid, setVocaloid] = useState<ExploreItem[]>([]);
  const [artists, setArtists] = useState<ArtistItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getRecentSongs(null, 12),
      getRisingSongs(12),
      getRecentSongs("보컬로이드", 12),
      getTopArtists(12),
    ])
      .then(([r, u, v, a]) => {
        if (cancelled) return;
        setRecent(r);
        setRising(u);
        setVocaloid(v);
        setArtists(a);
      })
      .catch((e) => console.error("[Explore] 큐레이션 로드 실패", e));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <ExploreCarousel title="최근 노래방에 등록" items={recent} />
      <ExploreCarousel title="요즘 순위가 오르는 곡" items={rising} />
      <ExploreCarousel title="보컬로이드 모음" items={vocaloid} />
      <ArtistList artists={artists} />
    </>
  );
}

function SongList({ results }: { results: SearchResult[] }) {
  return (
    <>
      {results.map((result) => {
        const firstTrack = result.karaoke_tracks[0];
        if (!firstTrack) return null;
        return (
          <SearchResultItem
            key={result.id}
            title={result.title_ko ?? firstTrack.title_in_provider}
            artist={result.artist_ko ?? firstTrack.artist_in_provider}
            tracks={result.karaoke_tracks.map((track) => ({
              provider: track.provider,
              karaokeNo: track.karaoke_no,
            }))}
            songId={result.id}
            query=""
          />
        );
      })}
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-24">
      <Compass size={72} className="text-gray-10" strokeWidth={1.2} />
      <p className="typo-caption text-content-secondary">{label}</p>
    </div>
  );
}

function CategoryList({ category }: { category: AiCategory }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCategorySongs(category)
      .then((rows) => {
        if (!cancelled) setResults(rows);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[Explore] 카테고리 로드 실패", e);
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (!loading && results.length === 0)
    return <EmptyState label="이 카테고리엔 아직 등록된 곡이 없어요" />;
  return <SongList results={results} />;
}

function ArtistView({ artistNorm }: { artistNorm: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getArtistSongs(artistNorm)
      .then((rows) => {
        if (!cancelled) setResults(rows);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[Explore] 가수 곡 로드 실패", e);
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [artistNorm]);

  const artistName = results[0]?.artist_ko ?? "";

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      {artistName && (
        <p className="typo-subtitle px-5 pb-2 pt-3 text-gray-white">
          {artistName}의 곡
        </p>
      )}
      {!loading && results.length === 0 ? (
        <EmptyState label="곡을 찾을 수 없어요" />
      ) : (
        <SongList results={results} />
      )}
    </div>
  );
}
