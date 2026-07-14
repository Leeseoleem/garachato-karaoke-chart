import { Suspense, type ReactNode } from "react";
import { Compass } from "lucide-react";
import BackHeader from "@/components/common/headers/BackHeader";
import ExploreHomeShell from "@/components/explore/ExploreHomeShell";
import { DetailListSkeleton } from "@/components/skeletons/pages/ExplorePageSkeleton";
import ExploreCarousel from "@/components/explore/ExploreCarousel";
import CategorySection from "@/components/explore/CategorySection";
import ArtistList from "@/components/explore/ArtistList";
import ArtistSearchList from "@/components/explore/ArtistSearchList";
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
  getAvailableCategories,
} from "@/lib/explore/queries";
import type { AiCategory } from "@/types/domain";
import type { ExploreSong } from "@/lib/explore/queries";

const DETAIL_VIEWS = ["recent", "rising", "vocaloid", "artists"];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; artist?: string; view?: string }>;
}) {
  const { category: categoryParam, artist, view } = await searchParams;
  const category: AiCategory | null =
    CATEGORIES.find((c) => c === categoryParam) ?? null;

  // 탐색 홈은 별개 탭이라 뒤로가기 없이 홈과 같은 검색 헤더 + 플로팅바를 공유한다.
  // 지원하는 상세 view도 아니고 가수·카테고리도 없으면(알 수 없는 view 등) 홈으로 폴백한다.
  const isDetail =
    (view != null && DETAIL_VIEWS.includes(view)) ||
    artist != null ||
    category != null;
  if (!isDetail) return <CurationHome />;

  // 상세는 별도 헤더 없이 본문 상단에 담백한 타이틀(+칩)을 고정하고 리스트만 스크롤한다.
  return (
    <div className="flex flex-col h-dvh min-h-0">
      {view === "recent" ? (
        <Suspense fallback={<DetailListSkeleton title="최근 진입한 곡" chips />}>
          <RecentDetail />
        </Suspense>
      ) : view === "rising" ? (
        <Suspense fallback={<DetailListSkeleton title="순위 상승된 곡" chips />}>
          <RisingDetail />
        </Suspense>
      ) : view === "vocaloid" ? (
        <Suspense fallback={<DetailListSkeleton title="보컬로이드" chips />}>
          <VocaloidDetail />
        </Suspense>
      ) : view === "artists" ? (
        <Suspense fallback={<DetailListSkeleton title="가수별 둘러보기" />}>
          <ArtistFullView />
        </Suspense>
      ) : artist ? (
        <Suspense fallback={<DetailListSkeleton title="가수" />}>
          <ArtistSongView artistNorm={artist} />
        </Suspense>
      ) : category ? (
        <Suspense fallback={<DetailListSkeleton title={category} />}>
          <CategorySongView category={category} />
        </Suspense>
      ) : null}
    </div>
  );
}

// 상세 공통 레이아웃: 헤더(뒤로가기+타이틀) 고정 + 리스트 영역만 스크롤.
function DetailView({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BackHeader title={title} />
      <div className="flex-1 overflow-y-auto pb-6">{children}</div>
    </div>
  );
}

async function CurationHome() {
  const [recent, rising, vocaloid, artists, categories] = await Promise.all([
    getRecentSongs(null, 12),
    getRisingSongs(12),
    getRecentSongs("보컬로이드", 12),
    getTopArtists(100),
    getAvailableCategories(),
  ]);

  return (
    <ExploreHomeShell>
      <ExploreCarousel
        title="차트에 새로 진입했어요"
        items={recent}
        moreHref="/explore?view=recent"
      />
      <ExploreCarousel
        title="순위 상승 중이에요"
        items={rising}
        moreHref="/explore?view=rising"
      />
      <ExploreCarousel
        title="보컬로이드 곡만 모았어요"
        items={vocaloid}
        moreHref="/explore?view=vocaloid"
      />
      <CategorySection categories={categories} />
      <ArtistList artists={artists} />
    </ExploreHomeShell>
  );
}

// 로드된 곡에 실제로 존재하는 카테고리만 칩으로 (빈 카테고리 숨김).
function presentCategories(songs: ExploreSong[]): AiCategory[] {
  return CATEGORIES.filter((c) => songs.some((s) => s.category === c));
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-24">
      <Compass size={72} className="text-gray-10" strokeWidth={1.2} />
      <p className="typo-caption text-content-secondary">{label}</p>
    </div>
  );
}

async function RecentDetail() {
  const songs = await getRecentRich();
  return (
    <FilteredSongList
      title="최근 진입한 곡"
      songs={songs}
      chips={presentCategories(songs)}
      mode="category"
      emptyLabel="해당 곡이 없어요"
    />
  );
}

async function RisingDetail() {
  const songs = await getRisingRich();
  return (
    <FilteredSongList
      title="순위 상승된 곡"
      songs={songs}
      chips={presentCategories(songs)}
      mode="category"
      emptyLabel="해당 곡이 없어요"
    />
  );
}

async function VocaloidDetail() {
  const songs = await getVocaloidRich();
  const present = new Set(songs.flatMap((s) => s.characters ?? []));
  const chips = VOCALOID_CHARACTERS.map((c) => c.ko).filter((ko) =>
    present.has(ko),
  );
  return (
    <FilteredSongList
      title="보컬로이드"
      songs={songs}
      chips={chips}
      mode="character"
      emptyLabel="해당 캐릭터 곡이 없어요"
    />
  );
}

async function CategorySongView({ category }: { category: AiCategory }) {
  const songs = await getCategorySongs(category);
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

async function ArtistSongView({ artistNorm }: { artistNorm: string }) {
  const songs = await getArtistSongs(artistNorm);
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

async function ArtistFullView() {
  const artists = await getTopArtists(100);
  if (artists.length === 0)
    return (
      <DetailView title="가수별 둘러보기">
        <EmptyState label="가수를 찾을 수 없어요" />
      </DetailView>
    );
  return <ArtistSearchList title="가수별 둘러보기" artists={artists} />;
}
