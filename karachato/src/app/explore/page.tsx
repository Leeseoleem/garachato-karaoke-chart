import { Suspense, type ReactNode } from "react";
import { Compass } from "lucide-react";
import BackHeader from "@/components/common/headers/BackHeader";
import ExploreHomeShell from "@/components/explore/ExploreHomeShell";
import { DetailListSkeleton } from "@/components/skeletons/pages/ExplorePageSkeleton";
import ExploreCarousel from "@/components/explore/ExploreCarousel";
import CategorySection from "@/components/explore/CategorySection";
import ArtistList, { ArtistRow } from "@/components/explore/ArtistList";
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

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; artist?: string; view?: string }>;
}) {
  const { category: categoryParam, artist, view } = await searchParams;
  const category: AiCategory | null =
    CATEGORIES.find((c) => c === categoryParam) ?? null;

  // 탐색 홈은 별개 탭이라 뒤로가기 없이 홈과 같은 검색 헤더 + 플로팅바를 공유한다.
  if (!view && !artist && !category) return <CurationHome />;

  // 상세는 뒤로가기 헤더는 "탐색"으로 두고, 본문 상단에 큰 타이틀·칩을 고정하고 리스트만 스크롤한다.
  return (
    <div className="flex flex-col h-dvh min-h-0">
      <BackHeader title="탐색" />
      {view === "recent" ? (
        <Suspense
          fallback={<DetailListSkeleton title="최근 노래방에 등록" chips />}
        >
          <RecentDetail />
        </Suspense>
      ) : view === "rising" ? (
        <Suspense
          fallback={<DetailListSkeleton title="요즘 순위가 오르는 곡" chips />}
        >
          <RisingDetail />
        </Suspense>
      ) : view === "vocaloid" ? (
        <Suspense
          fallback={<DetailListSkeleton title="보컬로이드 모음" chips />}
        >
          <VocaloidDetail />
        </Suspense>
      ) : view === "artists" ? (
        <Suspense fallback={<DetailListSkeleton title="가수별 둘러보기" />}>
          <ArtistFullView />
        </Suspense>
      ) : artist ? (
        <Suspense fallback={<DetailListSkeleton />}>
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

// 상세 공통 레이아웃: 타이틀 고정 + 리스트 영역만 스크롤.
function DetailView({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader title={title} />
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
        title="최근 노래방에 등록"
        items={recent}
        moreHref="/explore?view=recent"
      />
      <ExploreCarousel
        title="요즘 순위가 오르는 곡"
        items={rising}
        moreHref="/explore?view=rising"
      />
      <ExploreCarousel
        title="보컬로이드 모음"
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

// 드릴다운 화면의 얇은 큰 제목 (헤더에 담기 어려운 비동기 제목용).
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

async function RecentDetail() {
  const songs = await getRecentRich();
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

async function RisingDetail() {
  const songs = await getRisingRich();
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

async function VocaloidDetail() {
  const songs = await getVocaloidRich();
  const present = new Set(songs.flatMap((s) => s.characters ?? []));
  const chips = VOCALOID_CHARACTERS.map((c) => c.ko).filter((ko) =>
    present.has(ko),
  );
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
  return (
    <DetailView title="가수별 둘러보기">
      {artists.length === 0 ? (
        <EmptyState label="가수를 찾을 수 없어요" />
      ) : (
        <div className="px-5 pt-2">
          {artists.map((a) => (
            <ArtistRow key={a.artistNorm} artist={a} />
          ))}
        </div>
      )}
    </DetailView>
  );
}
