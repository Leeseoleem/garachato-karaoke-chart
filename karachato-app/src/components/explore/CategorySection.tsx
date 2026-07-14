import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/constants/explore";

// 카테고리 섹션. 탭하면 그 카테고리 곡 리스트(?category=)로.
export default function CategorySection() {
  const navigate = useNavigate();
  return (
    <section className="mt-9">
      <h2 className="px-5 pb-3 text-[15px] font-semibold tracking-[-0.01em] text-content-primary">
        카테고리
      </h2>
      <div className="flex flex-wrap gap-2 px-5">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() =>
              navigate(`/explore?category=${encodeURIComponent(category)}`)
            }
            className="typo-caption rounded-full bg-gray-40 px-4 py-2 text-content-primary transition-colors active:bg-gray-30"
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}
