import { Compass } from "lucide-react";
import BackHeader from "@/components/common/headers/BackHeader";
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
} from "@/lib/explore/queries";
import type { AiCategory } from "@/types/domain";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; artist?: string; view?: string }>;
}) {
  const { category: categoryParam, artist, view } = await searchParams;
  const category: AiCategory | null =
    CATEGORIES.find((c) => c === categoryParam) ?? null;

  const headerTitle =
    view === "recent"
      ? "최근 노래방에 등록"
      : view === "rising"
        ? "요즘 순위가 오르는 곡"
        : view === "vocaloid"
          ? "보컬로이드 모음"
          : view === "artists"
            ? "가수별 둘러보기"
            : category
              ? category
              : "탐색";

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <BackHeader title={headerTitle} />
      <div className="flex-1 overflow-y-auto pb-6">
        {view === "recent" ? (
          <RecentDetail />
        ) : view === "rising" ? (
          <RisingDetail />
        ) : view === "vocaloid" ? (
          <VocaloidDetail />
        ) : view === "artists" ? (
          <ArtistFullView />
        ) : artist ? (
          <ArtistSongView artistNorm={artist} />
        ) : category ? (
          <CategorySongView category={category} />
        ) : (
          <CurationHome />
        )}
      </div>
    </div>
  );
}

async function CurationHome() {
  const [recent, rising, vocaloid, artists] = await Promise.all([
    getRecentSongs(null, 12),
    getRisingSongs(12),
    getRecentSongs("보컬로이드", 12),
    getTopArtists(100),
  ]);

  return (
    <>
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
      <CategorySection />
      <ArtistList artists={artists} />
    </>
  );
}

// 드릴다운 화면의 얇은 큰 제목 (헤더에 담기 어려운 비동기 제목용).
function ViewHeader({ title }: { title: string }) {
  return (
    <h2 className="px-5 pb-2 pt-4 text-[22px] font-light leading-tight tracking-[-0.02em] text-content-primary">
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
      songs={songs}
      chips={CATEGORIES}
      mode="category"
      emptyLabel="해당 곡이 없어요"
    />
  );
}

async function RisingDetail() {
  const songs = await getRisingRich();
  return (
    <FilteredSongList
      songs={songs}
      chips={CATEGORIES}
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
      songs={songs}
      chips={chips}
      mode="character"
      emptyLabel="해당 캐릭터 곡이 없어요"
    />
  );
}

async function CategorySongView({ category }: { category: AiCategory }) {
  const songs = await getCategorySongs(category);
  if (songs.length === 0) {
    return <EmptyState label="이 카테고리엔 아직 등록된 곡이 없어요" />;
  }
  return (
    <>
      {songs.map((song) => (
        <SongListItem key={song.songId} song={song} />
      ))}
    </>
  );
}

async function ArtistSongView({ artistNorm }: { artistNorm: string }) {
  const songs = await getArtistSongs(artistNorm);
  const name = songs[0]?.artist ?? "";
  return (
    <>
      {name && <ViewHeader title={`${name}의 곡`} />}
      {songs.length === 0 ? (
        <EmptyState label="곡을 찾을 수 없어요" />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
  );
}

async function ArtistFullView() {
  const artists = await getTopArtists(100);
  if (artists.length === 0) {
    return <EmptyState label="가수를 찾을 수 없어요" />;
  }
  return (
    <div className="px-5 pt-2">
      {artists.map((a) => (
        <ArtistRow key={a.artistNorm} artist={a} />
      ))}
    </div>
  );
}
