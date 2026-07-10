import Link from "next/link";
import KaraokeBadge from "@/components/common/badges/KaraokeBadge";
import type { ExploreItem } from "@/lib/explore/queries";

// 탐색 캐러셀 카드. 순위 상승 곡은 ▲배지, 최근 등록 곡은 NEW/등록일.
export default function ExploreCard({ item }: { item: ExploreItem }) {
  const providers = [...new Set(item.providers)];

  return (
    <Link
      href={`/song/${item.songId}`}
      className="flex min-h-[132px] w-40 shrink-0 flex-col gap-2.5 rounded-2xl p-3.5 gradient-border transition active:brightness-125"
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex gap-1">
          {providers.slice(0, 2).map((p) => (
            <KaraokeBadge key={p} provider={p} />
          ))}
        </div>
        {item.delta != null ? (
          <span className="typo-caption font-bold text-status-up">
            ▲ {item.delta}
          </span>
        ) : item.isNew ? (
          <span className="typo-tag rounded border border-brand-accent/40 px-1.5 py-0.5 font-bold text-brand-accent">
            NEW
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <p className="typo-subtitle line-clamp-2 text-gray-white">
          {item.title}
        </p>
        <p className="typo-caption truncate text-content-secondary">
          {item.artist}
        </p>
        {item.meta && <p className="typo-tag text-gray-10">{item.meta}</p>}
      </div>
    </Link>
  );
}
