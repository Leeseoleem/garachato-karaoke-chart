import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Compass } from "lucide-react";
import DetailHeader from "@/components/common/headers/DetailHeader";
import SearchSection from "@/components/search/SearchSection";
import ChatModal from "@/components/modals/ChatModal";
import ExploreCarousel from "@/components/explore/ExploreCarousel";
import ExploreFloatingBar from "@/components/explore/ExploreFloatingBar";
import CategorySection from "@/components/explore/CategorySection";
import ArtistList, { ArtistRow } from "@/components/explore/ArtistList";
import SongListItem from "@/components/explore/SongListItem";
import FilteredSongList from "@/components/explore/FilteredSongList";
import { ExploreContentSkeleton } from "@/components/skeletons/pages/ExplorePageSkeleton";
import { useScrollTop } from "@/hooks/useScrollTop";
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
  getAvailableCategories,
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

  // 탐색 홈은 별개 탭이라 뒤로가기 없이 홈과 같은 검색 헤더 + 플로팅바를 공유한다.
  if (!view && !artistNorm && !category) return <ExploreHome />;

  // 상세는 뒤로가기 헤더는 "탐색"으로 두고, 본문 상단에 큰 타이틀·칩을 고정하고 리스트만 스크롤한다.
  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <DetailHeader title="탐색" />
      {view === "recent" ? (
        <RecentDetail />
      ) : view === "rising" ? (
        <RisingDetail />
      ) : view === "vocaloid" ? (
        <VocaloidDetail />
      ) : view === "artists" ? (
        <ArtistFullView />
      ) : artistNorm ? (
        <ArtistSongView artistNorm={artistNorm} />
      ) : category ? (
        <CategorySongView category={category} />
      ) : null}
    </div>
  );
}

// 상세 공통 레이아웃: 타이틀 고정 + 리스트 영역만 스크롤.
function DetailView({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader title={title} />
      <div className="flex-1 overflow-y-auto pb-6">{children}</div>
    </div>
  );
}

// 탐색 홈 쉘: 검색 헤더 공유 + 스크롤 + 홈 이동 플로팅바.
function ExploreHome() {
  const navigate = useNavigate();
  const { scrollRef, isScrolled } = useScrollTop();
  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden">
      <SearchSection />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-[calc(6rem+var(--safe-bottom,0px))]"
      >
        <CurationHome />
      </div>
      <ExploreFloatingBar
        isScrolled={isScrolled}
        onScrollToTop={() =>
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
        onHome={() => navigate("/")}
      />
      <ChatModal />
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

// 드릴다운 화면의 얇은 큰 제목 (상단 고정).
function ViewHeader({ title }: { title: string }) {
  return (
    <h2 className="shrink-0 px-5 pb-2 pt-4 text-[22px] font-light leading-tight tracking-[-0.02em] text-content-primary">
      {title}
    </h2>
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
  const [categories, setCategories] = useState<AiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getRecentSongs(null, 12),
      getRisingSongs(12),
      getRecentSongs("보컬로이드", 12),
      getTopArtists(100),
      getAvailableCategories(),
    ])
      .then(([r, u, v, a, c]) => {
        if (cancelled) return;
        setRecent(r);
        setRising(u);
        setVocaloid(v);
        setArtists(a);
        setCategories(c);
      })
      .catch((e) => console.error("[Explore] 큐레이션 로드 실패", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <ExploreContentSkeleton />;

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
      <CategorySection categories={categories} />
      <ArtistList artists={artists} />
    </>
  );
}

// 로드된 곡에 실제로 존재하는 카테고리만 칩으로 (빈 카테고리 숨김).
function presentCategories(songs: ExploreSong[]): AiCategory[] {
  return CATEGORIES.filter((c) => songs.some((s) => s.category === c));
}

function RecentDetail() {
  const { songs, loading } = useRich(() => getRecentRich(), "recent");
  if (loading) return null;
  return (
    <FilteredSongList
      title="최근 노래방에 등록"
      songs={songs}
      chips={presentCategories(songs)}
      mode="category"
      emptyLabel="해당 곡이 없어요"
    />
  );
}

function RisingDetail() {
  const { songs, loading } = useRich(() => getRisingRich(), "rising");
  if (loading) return null;
  return (
    <FilteredSongList
      title="요즘 순위가 오르는 곡"
      songs={songs}
      chips={presentCategories(songs)}
      mode="category"
      emptyLabel="해당 곡이 없어요"
    />
  );
}

function VocaloidDetail() {
  const { songs, loading } = useRich(() => getVocaloidRich(), "vocaloid");
  const present = new Set(songs.flatMap((s) => s.characters ?? []));
  const chips = VOCALOID_CHARACTERS.map((c) => c.ko).filter((ko) =>
    present.has(ko),
  );
  if (loading) return null;
  return (
    <FilteredSongList
      title="보컬로이드 모음"
      songs={songs}
      chips={chips}
      mode="character"
      emptyLabel="해당 캐릭터 곡이 없어요"
    />
  );
}

function CategorySongView({ category }: { category: AiCategory }) {
  const { songs, loading } = useRich(() => getCategorySongs(category), category);
  if (loading) return null;
  return (
    <DetailView title={category}>
      {songs.length === 0 ? (
        <EmptyState label="이 카테고리엔 아직 등록된 곡이 없어요" />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </DetailView>
  );
}

function ArtistSongView({ artistNorm }: { artistNorm: string }) {
  const { songs, loading } = useRich(
    () => getArtistSongs(artistNorm),
    artistNorm,
  );
  if (loading) return null;
  const name = songs[0]?.artist ?? "";
  return (
    <DetailView title={name ? `${name}의 곡` : "가수"}>
      {songs.length === 0 ? (
        <EmptyState label="곡을 찾을 수 없어요" />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </DetailView>
  );
}

function ArtistFullView() {
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    getTopArtists(100)
      .then((a) => {
        if (!cancelled) setArtists(a);
      })
      .catch((e) => console.error("[Explore] 가수 목록 로드 실패", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;
  return (
    <DetailView title="가수별 둘러보기">
      {artists.length === 0 ? (
        <EmptyState label="가수를 찾을 수 없어요" />
      ) : (
        <ArtistFullList artists={artists} />
      )}
    </DetailView>
  );
}

function ArtistFullList({ artists }: { artists: ArtistItem[] }) {
  return (
    <div className="px-5 pt-2">
      {artists.map((a) => (
        <ArtistRow key={a.artistNorm} artist={a} />
      ))}
    </div>
  );
}
