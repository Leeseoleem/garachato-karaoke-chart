import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ArtistItem } from "@/lib/explore/queries";

// 가수별 둘러보기 섹션. 탭하면 그 가수 곡 목록(?artist=)으로.
export default function ArtistList({ artists }: { artists: ArtistItem[] }) {
  if (artists.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="typo-subtitle px-5 pb-2 text-gray-white">
        가수별 둘러보기
      </h2>
      <div className="px-5">
        {artists.map((a) => (
          <Link
            key={a.artistNorm}
            href={`/explore?artist=${encodeURIComponent(a.artistNorm)}`}
            className="flex w-full items-center gap-3 border-b border-gray-30 py-3 transition-colors active:bg-gray-40"
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
          </Link>
        ))}
      </div>
    </section>
  );
}
