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
    artistKo: string | null; // 아티스트 번역
  };
  action: KaraokeActionProps;
}

export default function RankCard({
  songId,
  rank,
  song,
  action,
}: RankCardProps) {
  const { displayMode, translationScope } = useChartStore();

  const mainTitle =
    displayMode === "original"
      ? song.titleInProvider // 원문인 경우
      : translationScope === "jp_only"
        ? (song.titleKoJp ?? song.titleInProvider) // 번역이면서 범위가 일본어인 경우
        : (song.titleKoFull ?? song.titleInProvider); // 번역이면서 범위가 영어까지인 경우

  const subTitle = displayMode === "translated" ? song.titleInProvider : null;

  const artistMain =
    displayMode === "original"
      ? song.artistInProvider
      : (song.artistKo ?? song.artistInProvider);

  const artistSub = displayMode === "translated" ? song.artistInProvider : null;

  const colClass = "flex flex-col items-start";

  return (
    <div className="relative flex flex-row justify-between items-center w-full px-5 pt-4 pb-3 border-b border-gray-30 hover:bg-gray-50/20 active:bg-gray-50/40 transition-colors duration-300">
      <Link href={`/song/${songId}`} className="absolute inset-0 z-0" />
      <div className="pointer-events-none flex flex-row gap-5 justify-center">
        <RankColumn {...rank} />
        <div className={clsx(colClass, "justify-center")}>
          <div
            className={clsx(
              colClass,
              displayMode === "original" ? "gap-2" : "gap-3",
            )}
          >
            <div className={clsx(colClass, "gap-1 pr-3 whitespace-pre-wrap")}>
              <p className="typo-subtitle text-gray-white">{mainTitle}</p>
              {subTitle && (
                <p className="typo-body font-light text-content-primary">
                  {subTitle}
                </p>
              )}
            </div>
            <div className={clsx(colClass, "gap-1")}>
              {artistMain && (
                <p className="typo-caption text-content-primary">
                  {artistMain}
                </p>
              )}
              {artistSub && (
                <p className="typo-caption text-content-secondary">
                  {artistSub}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <KaraokeAction {...action} />
      </div>
    </div>
  );
}
