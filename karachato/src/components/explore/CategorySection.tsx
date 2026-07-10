import Link from "next/link";
import { CATEGORIES } from "@/constants/explore";

// 카테고리 섹션. 탭하면 그 카테고리 곡 리스트(?category=)로.
export default function CategorySection() {
  return (
    <section className="mt-6">
      <h2 className="typo-subtitle px-5 pb-3 text-gray-white">카테고리</h2>
      <div className="flex flex-wrap gap-2 px-5">
        {CATEGORIES.map((category) => (
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
