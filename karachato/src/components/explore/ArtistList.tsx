import Link from "next/link";
import { ChevronRight, Music2 } from "lucide-react";
import type { ArtistItem } from "@/lib/explore/queries";
import { highlight } from "@/utils/highlight";

const PREVIEW = 5;

// 가수 한 줄. 음표 그라데이션 원형 아바타 + 이름 + 곡 수. 클릭 시 해당 가수 곡 목록으로.
// query가 있으면 이름에서 매칭 부분을 하이라이트.
export function ArtistRow({
  artist,
  query,
}: {
  artist: ArtistItem;
  query?: string;
}) {
  return (
    <Link
      href={`/explore?artist=${encodeURIComponent(artist.artistNorm)}`}
      className="flex w-full items-center gap-3 border-b border-white/[0.07] py-4 transition-colors active:bg-gray-40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-accent to-brand-main">
        <Music2 size={18} strokeWidth={1.8} className="text-white" />
      </span>
      <span className="typo-body flex-1 truncate text-content-primary">
        {query ? highlight(artist.artistKo, query) : artist.artistKo}
      </span>
      <span className="typo-caption text-content-secondary">
        {artist.count}곡
      </span>
      <ChevronRight size={18} className="text-gray-10" />
    </Link>
  );
}

// 가수별 둘러보기. 미리보기 5명 + "가수 전체보기"로 전체 목록(?view=artists) 이동.
export default function ArtistList({ artists }: { artists: ArtistItem[] }) {
  if (artists.length === 0) return null;

  const shown = artists.slice(0, PREVIEW);
  const hasMore = artists.length > PREVIEW;

  return (
    <section className="mb-6 mt-9">
      <h2 className="px-5 pb-2 text-[15px] font-semibold tracking-[-0.01em] text-content-primary">
        가수별 둘러보기
      </h2>
      <div className="px-5">
        {shown.map((a) => (
          <ArtistRow key={a.artistNorm} artist={a} />
        ))}
      </div>
      {hasMore && (
        <div className="px-5 pt-4">
          <Link
            href="/explore?view=artists"
            className="block w-full rounded-[14px] border border-white/[0.07] py-3 text-center text-[13px] font-medium text-content-secondary transition active:bg-gray-40"
          >
            가수 전체보기
          </Link>
        </div>
      )}
    </section>
  );
}
