import { Compass } from "lucide-react";
import BackHeader from "@/components/common/headers/BackHeader";
import CategoryChips, {
  CATEGORIES,
} from "@/components/explore/CategoryChips";
import ExploreCarousel from "@/components/explore/ExploreCarousel";
import SearchResultItem from "@/components/search/SearchResultItem";
import {
  getRecentSongs,
  getRisingSongs,
  getCategorySongs,
} from "@/lib/explore/queries";
import type { AiCategory } from "@/types/domain";

// 탐색: 큐레이션 캐러셀 홈(최근등록·순위상승·보컬로이드) + 카테고리 필터.
// 카테고리를 고르면 그 카테고리 곡 리스트로 좁힌다. (가수별·더보기는 후속)
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const category: AiCategory | null =
    CATEGORIES.find((c) => c === categoryParam) ?? null;

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <BackHeader title="탐색" />
      <CategoryChips active={category} />
      <div className="flex-1 overflow-y-auto pb-6">
        {category ? <CategoryList category={category} /> : <CurationHome />}
      </div>
    </div>
  );
}

async function CurationHome() {
  const [recent, rising, vocaloid] = await Promise.all([
    getRecentSongs(null, 12),
    getRisingSongs(12),
    getRecentSongs("보컬로이드", 12),
  ]);

  return (
    <>
      <ExploreCarousel title="최근 노래방에 등록" items={recent} />
      <ExploreCarousel title="요즘 순위가 오르는 곡" items={rising} />
      <ExploreCarousel title="보컬로이드 모음" items={vocaloid} />
    </>
  );
}

async function CategoryList({ category }: { category: AiCategory }) {
  const results = await getCategorySongs(category);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 pt-24">
        <Compass size={72} className="text-gray-10" strokeWidth={1.2} />
        <p className="typo-caption text-content-secondary">
          이 카테고리엔 아직 등록된 곡이 없어요
        </p>
      </div>
    );
  }

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
