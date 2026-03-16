"use client";

import Link from "next/link";
import clsx from "clsx";

// === component ===
import RankColumn, { type RankColumnProps } from "./RankColumn";
import KaraokeAction, { type KaraokeActionProps } from "./KaraokeAction";

import { useChartStore } from "@/store/chartStore";

export interface RankCardProps {
  songId: string;
  rank: RankColumnProps;
  song: {
    titleInProvider: string; // 원문
    titleKoJp: string | null; // 일본어만 번역
    titleKoFull: string | null; // 영어까지 번역
    artistInProvider: string; // 아티스트 원문
  };
  action: KaraokeActionProps;
}

export default function RankCard({
  songId,
  rank,
  song,
  action,
}: RankCardProps) {
  const { displayMode } = useChartStore();

  const mainTitle =
    displayMode === "translated"
      ? (song.titleKoJp ?? song.titleInProvider)
      : song.titleInProvider;

  const subTitle = displayMode === "translated" ? song.titleInProvider : null;

  const colClass = "flex flex-col items-start";

  return (
    <Link
      href={`/song/${songId}`}
      className="flex flex-row justify-between items-center w-full px-5 pt-4 pb-3 border-b border-gray-30 hover:bg-gray-50/20 active:bg-gray-50/40 transition-colors duration-300"
    >
      <div className="flex flex-row gap-5 items-center justify-center">
        <RankColumn {...rank} />
        <div className={clsx(colClass, "gap-3")}>
          <div className={clsx(colClass, "gap-1")}>
            <p className="typo-subtitle text-gray-white">{mainTitle}</p>
            {subTitle && (
              <p className="typo-body text-content-primary">{subTitle}</p>
            )}
          </div>
          <p className="typo-caption text-content-secondary">
            {song.artistInProvider}
          </p>
        </div>
      </div>
      <KaraokeAction {...action} />
    </Link>
  );
}
