import { useState } from "react";
import clsx from "clsx";
import HScroll from "@/components/common/HScroll";
import SongListItem from "./SongListItem";
import type { ExploreSong } from "@/lib/explore/queries";

// 칩 필터 + 리치 곡 리스트. 타이틀·칩은 상단 고정, 리스트만 스크롤.
export default function FilteredSongList({
  title,
  songs,
  chips,
  mode,
  emptyLabel,
}: {
  title: string;
  songs: ExploreSong[];
  chips: string[];
  mode: "category" | "character";
  emptyLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered =
    active === null
      ? songs
      : songs.filter((s) =>
          mode === "category"
            ? s.category === active
            : (s.characters ?? []).includes(active),
        );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h2 className="shrink-0 px-5 pb-2 pt-4 text-[22px] font-light leading-tight tracking-[-0.02em] text-content-primary">
        {title}
      </h2>
      <HScroll className="flex shrink-0 gap-2 overflow-x-auto px-5 py-3 [&::-webkit-scrollbar]:hidden">
        <Chip label="전체" active={active === null} onClick={() => setActive(null)} />
        {chips.map((c) => (
          <Chip
            key={c}
            label={c}
            active={active === c}
            onClick={() => setActive(c)}
          />
        ))}
      </HScroll>
      <div className="flex-1 overflow-y-auto pb-6">
        {filtered.length === 0 ? (
          <p className="typo-caption px-5 py-10 text-center text-content-secondary">
            {emptyLabel}
          </p>
        ) : (
          filtered.map((song) => (
            <SongListItem key={song.songId} song={song} />
          ))
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "typo-caption shrink-0 whitespace-nowrap rounded-full px-4 py-2 transition-colors",
        active
          ? "bg-brand-main text-gray-white"
          : "bg-gray-40 text-content-secondary",
      )}
    >
      {label}
    </button>
  );
}
