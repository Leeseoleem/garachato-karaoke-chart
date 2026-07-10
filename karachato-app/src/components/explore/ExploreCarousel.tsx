import type { ExploreItem } from "@/lib/explore/queries";
import ExploreCard from "./ExploreCard";

// 가로 스크롤 큐레이션 섹션 (제목 + 카드들). 곡이 없으면 렌더 안 함.
export default function ExploreCarousel({
  title,
  items,
}: {
  title: string;
  items: ExploreItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-5">
      <h2 className="typo-subtitle px-5 pb-3 text-gray-white">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <ExploreCard key={item.songId} item={item} />
        ))}
      </div>
    </section>
  );
}
