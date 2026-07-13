import { Compass } from "lucide-react";
import BackHeader from "@/components/common/headers/BackHeader";
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

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <BackHeader title="탐색" />
      <div className="flex-1 overflow-y-auto pb-6">
        {view === "recent" ? (
          <RecentDetail />
        ) : view === "rising" ? (
          <RisingDetail />
        ) : view === "vocaloid" ? (
          <VocaloidDetail />
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

async function RecentDetail() {
  const songs = await getRecentRich();
  return (
    <>
      <SectionTitle>최근 노래방에 등록</SectionTitle>
      <FilteredSongList
        songs={songs}
        chips={CATEGORIES}
        mode="category"
        emptyLabel="해당 곡이 없어요"
      />
    </>
  );
}

async function RisingDetail() {
  const songs = await getRisingRich();
  return (
    <>
      <SectionTitle>요즘 순위가 오르는 곡</SectionTitle>
      <FilteredSongList
        songs={songs}
        chips={CATEGORIES}
        mode="category"
        emptyLabel="해당 곡이 없어요"
      />
    </>
  );
}

async function VocaloidDetail() {
  const songs = await getVocaloidRich();
  const present = new Set(songs.flatMap((s) => s.characters ?? []));
  const chips = VOCALOID_CHARACTERS.map((c) => c.ko).filter((ko) =>
    present.has(ko),
  );
  return (
    <>
      <SectionTitle>보컬로이드 모음</SectionTitle>
      <FilteredSongList
        songs={songs}
        chips={chips}
        mode="character"
        emptyLabel="해당 캐릭터 곡이 없어요"
      />
    </>
  );
}

async function CategorySongView({ category }: { category: AiCategory }) {
  const songs = await getCategorySongs(category);
  return (
    <>
      <SectionTitle>{category}</SectionTitle>
      {songs.length === 0 ? (
        <EmptyState label="이 카테고리엔 아직 등록된 곡이 없어요" />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
  );
}

async function ArtistSongView({ artistNorm }: { artistNorm: string }) {
  const songs = await getArtistSongs(artistNorm);
  const name = songs[0]?.artist ?? "";
  return (
    <>
      {name && <SectionTitle>{`${name}의 곡`}</SectionTitle>}
      {songs.length === 0 ? (
        <EmptyState label="곡을 찾을 수 없어요" />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
  );
}
