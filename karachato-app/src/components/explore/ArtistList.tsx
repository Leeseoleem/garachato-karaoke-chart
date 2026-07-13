import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ArtistItem } from "@/lib/explore/queries";

const STEP = 5;

// 가수별 둘러보기. 5개부터 "5개 더보기"로 인라인 확장(계속). 언마운트(이탈)되면 5로 초기화.
export default function ArtistList({ artists }: { artists: ArtistItem[] }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(STEP);
  if (artists.length === 0) return null;

  const shown = artists.slice(0, visible);
  const hasMore = visible < artists.length;

  return (
    <section className="mt-6">
      <h2 className="typo-subtitle px-5 pb-2 text-gray-white">
        가수별 둘러보기
      </h2>
      <div className="px-5">
        {shown.map((a) => (
          <button
            key={a.artistNorm}
            type="button"
            onClick={() =>
              navigate(`/explore?artist=${encodeURIComponent(a.artistNorm)}`)
            }
            className="flex w-full items-center gap-3 border-b border-gray-30 py-3 text-left transition-colors active:bg-gray-40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-main to-brand-dark typo-subtitle text-gray-white">
              {a.artistKo.charAt(0)}
            </span>
            <span className="typo-body flex-1 truncate text-content-primary">
              {a.artistKo}
            </span>
            <span className="typo-caption text-content-secondary">
              {a.count}곡
            </span>
            <ChevronRight size={18} className="text-gray-10" />
          </button>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + STEP)}
          className="typo-caption mt-3 w-full text-center text-content-secondary"
        >
          {STEP}개 더보기 ›
        </button>
      )}
    </section>
  );
}
