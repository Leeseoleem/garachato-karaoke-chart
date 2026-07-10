import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ArtistItem } from "@/lib/explore/queries";

const PREVIEW_COUNT = 5;

// 가수별 둘러보기. 홈에선 미리보기(5개)+더보기, full이면 전체.
export default function ArtistList({
  artists,
  full = false,
}: {
  artists: ArtistItem[];
  full?: boolean;
}) {
  const navigate = useNavigate();
  if (artists.length === 0) return null;

  const shown = full ? artists : artists.slice(0, PREVIEW_COUNT);
  const hasMore = !full && artists.length > PREVIEW_COUNT;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-5 pb-2">
        <h2 className="typo-subtitle text-gray-white">가수별 둘러보기</h2>
        {hasMore && (
          <button
            type="button"
            onClick={() => navigate("/explore?view=artists")}
            className="typo-caption text-content-secondary"
          >
            더보기 ›
          </button>
        )}
      </div>
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
    </section>
  );
}
