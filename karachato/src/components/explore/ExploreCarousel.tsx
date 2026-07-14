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
    <section className="mt-9">
      <div className="flex items-baseline justify-between px-5 pb-3.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-content-primary">
          {title}
        </h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="text-[12px] font-medium text-gray-10"
          >
            더보기 ›
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden sm:gap-5">
        {items.map((item) => (
          <ExploreCard key={item.songId} item={item} />
        ))}
      </div>
    </section>
  );
}
