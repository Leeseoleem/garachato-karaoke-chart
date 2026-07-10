import { Compass } from "lucide-react";
import BackHeader from "@/components/common/headers/BackHeader";
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
  type ExploreSong,
} from "@/lib/explore/queries";
import type { AiCategory } from "@/types/domain";

// 탐색: 큐레이션 캐러셀 + 카테고리 섹션 + 가수별 섹션.
// ?category → 카테고리 곡, ?artist → 가수 곡, ?view=artists → 전체 가수 목록.
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
        {view === "artists" ? (
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
    getTopArtists(6),
  ]);

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

async function ArtistFullView() {
  const artists = await getTopArtists(100);
  return <ArtistList artists={artists} full />;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-24">
      <Compass size={72} className="text-gray-10" strokeWidth={1.2} />
      <p className="typo-caption text-content-secondary">{label}</p>
    </div>
  );
}

function SongList({
  songs,
  title,
  emptyLabel,
}: {
  songs: ExploreSong[];
  title: string;
  emptyLabel: string;
}) {
  return (
    <>
      {title.trim() && (
        <p className="typo-subtitle px-5 pb-2 pt-3 text-gray-white">{title}</p>
      )}
      {songs.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        songs.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
  );
}

async function CategorySongView({ category }: { category: AiCategory }) {
  const songs = await getCategorySongs(category);
  return (
    <SongList
      songs={songs}
      title={category}
      emptyLabel="이 카테고리엔 아직 등록된 곡이 없어요"
    />
  );
}

async function ArtistSongView({ artistNorm }: { artistNorm: string }) {
  const songs = await getArtistSongs(artistNorm);
  const name = songs[0]?.artist ?? "";
  return (
    <SongList
      songs={songs}
      title={name ? `${name}의 곡` : " "}
      emptyLabel="곡을 찾을 수 없어요"
    />
  );
}
