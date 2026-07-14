import { Link } from "react-router-dom";
import clsx from "clsx";
import { Music2 } from "lucide-react";
import type { ExploreItem } from "@/lib/explore/queries";
import type { KaraokeProvider } from "@/types/domain";

// 탐색 캐러셀 카드. 상단 16:9 썸네일 + 오버레이 배지(제공처/NEW/▲), 하단 제목·가수·메타.
export default function ExploreCard({ item }: { item: ExploreItem }) {
  const providers = [...new Set(item.providers)];
  const primaryProvider: KaraokeProvider | undefined = providers.includes("TJ")
    ? "TJ"
    : providers[0];
  const isRising = item.delta != null;
  const meta =
    isRising && item.rank != null ? `지금 ${item.rank}위` : item.meta;

  return (
    <Link
      to={`/song/${item.songId}`}
      className="flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border gradient-border transition active:brightness-125 sm:w-52 md:w-60"
    >
      <div className="relative aspect-[16/9] bg-linear-to-br from-brand-dark to-gray-50">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-gray-white/20">
            <Music2 size={20} strokeWidth={1.6} />
          </span>
        )}

        {!isRising && primaryProvider && (
          <span className="absolute left-2 top-2">
            <ProviderPill provider={primaryProvider} />
          </span>
        )}
        <span className="absolute right-2 top-2">
          {isRising ? (
            <span className="typo-tag rounded-full bg-black/50 px-2 py-1 font-bold text-status-up">
              ▲ {item.delta}
            </span>
          ) : item.isNew ? (
            <span className="typo-tag rounded-full bg-black/50 px-2 py-1 font-bold text-brand-accent">
              NEW
            </span>
          ) : null}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:gap-2">
          <p className="typo-subtitle line-clamp-2 leading-snug text-gray-white sm:text-[15px]">
            {item.title}
          </p>
          <p className="typo-caption truncate text-content-secondary sm:text-[13px]">
            {item.artist}
          </p>
        </div>
        {meta && (
          <p className="typo-tag text-gray-10 sm:text-[11px]">{meta}</p>
        )}
      </div>
    </Link>
  );
}

function ProviderPill({ provider }: { provider: KaraokeProvider }) {
  return (
    <span
      className={clsx(
        "typo-tag rounded-full border bg-brand-dark px-2 py-1 font-bold",
        provider === "TJ"
          ? "border-brand-accent/50 text-brand-accent"
          : "border-brand-light/50 text-brand-light",
      )}
    >
      {provider}
    </span>
  );
}
