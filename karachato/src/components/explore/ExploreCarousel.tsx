import Link from "next/link";
import type { ExploreItem } from "@/lib/explore/queries";
import ExploreCard from "./ExploreCard";

// 가로 스크롤 큐레이션 섹션. moreHref가 있으면 "더보기 ›" 노출.
export default function ExploreCarousel({
  title,
  items,
  moreHref,
}: {
  title: string;
  items: ExploreItem[];
  moreHref?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between px-5 pb-3">
        <h2 className="typo-subtitle text-gray-white">{title}</h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="typo-caption text-content-secondary"
          >
            더보기 ›
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <ExploreCard key={item.songId} item={item} />
        ))}
      </div>
    </section>
  );
}
