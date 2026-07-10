import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Compass } from "lucide-react";
import DetailHeader from "@/components/common/headers/DetailHeader";
import ExploreCarousel from "@/components/explore/ExploreCarousel";
import CategorySection from "@/components/explore/CategorySection";
import ArtistList from "@/components/explore/ArtistList";
import SongListItem from "@/components/explore/SongListItem";
import { CATEGORIES } from "@/constants/explore";
import {
  getRecentSongs,
  getRisingSongs,
  getCategorySongs,
  getTopArtists,
  getArtistSongs,
  type ExploreItem,
  type ExploreSong,
  type ArtistItem,
} from "@/lib/explore/queries";
import type { AiCategory } from "@/types/domain";

// 탐색: 큐레이션 캐러셀 + 카테고리 섹션 + 가수별 섹션.
// ?category → 카테고리 곡, ?artist → 가수 곡, ?view=artists → 전체 가수 목록.
export default function Explore() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");
  const artistNorm = searchParams.get("artist");
  const categoryParam = searchParams.get("category");
  const category: AiCategory | null =
    CATEGORIES.find((c) => c === categoryParam) ?? null;

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <DetailHeader title="탐색" />
      <div className="flex-1 overflow-y-auto pb-6">
        {view === "artists" ? (
          <ArtistFullView />
        ) : artistNorm ? (
          <ArtistSongView artistNorm={artistNorm} />
        ) : category ? (
          <CategorySongView category={category} />
        ) : (
          <CurationHome />
        )}
      </div>
    </div>
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
      getTopArtists(6),
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
      <CategorySection />
      <ArtistList artists={artists} />
    </>
  );
}

function ArtistFullView() {
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    getTopArtists(100)
      .then((a) => {
        if (!cancelled) setArtists(a);
      })
      .catch((e) => console.error("[Explore] 가수 목록 실패", e));
    return () => {
      cancelled = true;
    };
  }, []);
  return <ArtistList artists={artists} full />;
}

// 안정 키(depKey)로만 재조회하는 곡 로더
function useSongs(loader: () => Promise<ExploreSong[]>, depKey: string) {
  const [songs, setSongs] = useState<ExploreSong[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loader()
      .then((s) => {
        if (!cancelled) setSongs(s);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[Explore] 곡 로드 실패", e);
        setSongs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);
  return { songs, loading };
}

function SongListView({
  title,
  songs,
  loading,
  emptyLabel,
}: {
  title: string;
  songs: ExploreSong[];
  loading: boolean;
  emptyLabel: string;
}) {
  return (
    <>
      {title.trim() && (
        <p className="typo-subtitle px-5 pb-2 pt-3 text-gray-white">{title}</p>
      )}
      {!loading && songs.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
  );
}

function CategorySongView({ category }: { category: AiCategory }) {
  const { songs, loading } = useSongs(
    () => getCategorySongs(category),
    category,
  );
  return (
    <SongListView
      title={category}
      songs={songs}
      loading={loading}
      emptyLabel="이 카테고리엔 아직 등록된 곡이 없어요"
    />
  );
}

function ArtistSongView({ artistNorm }: { artistNorm: string }) {
  const { songs, loading } = useSongs(
    () => getArtistSongs(artistNorm),
    artistNorm,
  );
  const name = songs[0]?.artist ?? "";
  return (
    <SongListView
      title={name ? `${name}의 곡` : " "}
      songs={songs}
      loading={loading}
      emptyLabel="곡을 찾을 수 없어요"
    />
  );
}
