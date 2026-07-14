import Link from "next/link";
import type { AiCategory } from "@/types/domain";

// 카테고리 섹션. 곡이 있는 카테고리만 노출. 탭하면 그 카테고리 곡 리스트(?category=)로.
export default function CategorySection({
  categories,
}: {
  categories: AiCategory[];
}) {
  if (categories.length === 0) return null;
  return (
    <section className="mt-9">
      <h2 className="px-5 pb-3 text-[15px] font-semibold tracking-[-0.01em] text-content-primary">
        카테고리
      </h2>
      <div className="flex flex-wrap gap-2 px-5">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/explore?category=${encodeURIComponent(category)}`}
            className="typo-caption rounded-full bg-gray-40 px-4 py-2 text-content-primary transition-colors active:bg-gray-30"
          >
            {category}
          </Link>
        ))}
      </div>
    </section>
  );
}
