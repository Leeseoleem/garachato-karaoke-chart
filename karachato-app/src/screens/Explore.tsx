import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Compass } from "lucide-react";
import DetailHeader from "@/components/common/headers/DetailHeader";
import ExploreCarousel from "@/components/explore/ExploreCarousel";
import CategorySection from "@/components/explore/CategorySection";
import ArtistList from "@/components/explore/ArtistList";
import SongListItem from "@/components/explore/SongListItem";
import FilteredSongList from "@/components/explore/FilteredSongList";
import { CATEGORIES, VOCALOID_CHARACTERS } from "@/constants/explore";
import {
  getRecentSongs,
  getRisingSongs,
  getRecentRich,
  getRisingRich,
  getVocaloidRich,
  getCategorySongs,
  getTopArtists,
  getArtistSongs,
  type ExploreItem,
  type ExploreSong,
  type ArtistItem,
} from "@/lib/explore/queries";
import type { AiCategory } from "@/types/domain";

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
        {view === "recent" ? (
          <RecentDetail />
        ) : view === "rising" ? (
          <RisingDetail />
        ) : view === "vocaloid" ? (
          <VocaloidDetail />
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

function useRich(loader: () => Promise<ExploreSong[]>, depKey: string) {
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

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="typo-subtitle px-5 pb-1 pt-3 text-gray-white">{children}</p>
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
  const navigate = useNavigate();
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
      getTopArtists(100),
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
      <ExploreCarousel
        title="최근 노래방에 등록"
        items={recent}
        onMore={() => navigate("/explore?view=recent")}
      />
      <ExploreCarousel
        title="요즘 순위가 오르는 곡"
        items={rising}
        onMore={() => navigate("/explore?view=rising")}
      />
      <ExploreCarousel
        title="보컬로이드 모음"
        items={vocaloid}
        onMore={() => navigate("/explore?view=vocaloid")}
      />
      <CategorySection />
      <ArtistList artists={artists} />
    </>
  );
}

function RecentDetail() {
  const { songs, loading } = useRich(() => getRecentRich(), "recent");
  return (
    <>
      <SectionTitle>최근 노래방에 등록</SectionTitle>
      {!loading && (
        <FilteredSongList
          songs={songs}
          chips={CATEGORIES}
          mode="category"
          emptyLabel="해당 곡이 없어요"
        />
      )}
    </>
  );
}

function RisingDetail() {
  const { songs, loading } = useRich(() => getRisingRich(), "rising");
  return (
    <>
      <SectionTitle>요즘 순위가 오르는 곡</SectionTitle>
      {!loading && (
        <FilteredSongList
          songs={songs}
          chips={CATEGORIES}
          mode="category"
          emptyLabel="해당 곡이 없어요"
        />
      )}
    </>
  );
}

function VocaloidDetail() {
  const { songs, loading } = useRich(() => getVocaloidRich(), "vocaloid");
  const present = new Set(songs.flatMap((s) => s.characters ?? []));
  const chips = VOCALOID_CHARACTERS.map((c) => c.ko).filter((ko) =>
    present.has(ko),
  );
  return (
    <>
      <SectionTitle>보컬로이드 모음</SectionTitle>
      {!loading && (
        <FilteredSongList
          songs={songs}
          chips={chips}
          mode="character"
          emptyLabel="해당 캐릭터 곡이 없어요"
        />
      )}
    </>
  );
}

function CategorySongView({ category }: { category: AiCategory }) {
  const { songs, loading } = useRich(() => getCategorySongs(category), category);
  return (
    <>
      <SectionTitle>{category}</SectionTitle>
      {!loading && songs.length === 0 ? (
        <EmptyState label="이 카테고리엔 아직 등록된 곡이 없어요" />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
  );
}

function ArtistSongView({ artistNorm }: { artistNorm: string }) {
  const { songs, loading } = useRich(() => getArtistSongs(artistNorm), artistNorm);
  const name = songs[0]?.artist ?? "";
  return (
    <>
      {name && <SectionTitle>{`${name}의 곡`}</SectionTitle>}
      {!loading && songs.length === 0 ? (
        <EmptyState label="곡을 찾을 수 없어요" />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
  );
}
