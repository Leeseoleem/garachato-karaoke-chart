import { useState } from "react";
import clsx from "clsx";
import SongListItem from "./SongListItem";
import type { ExploreSong } from "@/lib/explore/queries";

// 칩 필터 + 리치 곡 리스트. mode에 따라 카테고리/캐릭터로 클라에서 리필터.
export default function FilteredSongList({
  songs,
  chips,
  mode,
  emptyLabel,
}: {
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
    <>
      <div className="flex shrink-0 gap-2 overflow-x-auto px-5 py-3 [&::-webkit-scrollbar]:hidden">
        <Chip label="전체" active={active === null} onClick={() => setActive(null)} />
        {chips.map((c) => (
          <Chip
            key={c}
            label={c}
            active={active === c}
            onClick={() => setActive(c)}
          />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="typo-caption px-5 py-10 text-center text-content-secondary">
          {emptyLabel}
        </p>
      ) : (
        filtered.map((song) => <SongListItem key={song.songId} song={song} />)
      )}
    </>
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
