"use client";

import type { KaraokeProvider } from "@/types/domain";

import Link from "next/link";
import clsx from "clsx";

interface KaraokeTrack {
  provider: KaraokeProvider;
  karaokeNo: string; // karaoke_no
}

export interface SongCardProps {
  songId: string; // songs.id
  titleKo: string | null; // songs.title_ko
  artistKo: string | null; // songs.artist_ko
  titleInProvider: string; // karaoke_tracks.title_in_provider
  artistInProvider: string; // karaoke_tracks.artist_in_provider
  karaokeTracks: KaraokeTrack[]; // karaoke_tracks[]
  isInTop100: boolean; // rank_history 조회 결과
}

export default function SongCard({
  songId,
  titleKo,
  artistKo,
  titleInProvider,
  artistInProvider,
  karaokeTracks,
  isInTop100,
}: SongCardProps) {
  const trackNoMap: Record<string, string> = { TJ: "-", KY: "-" };
  karaokeTracks.forEach((t) => {
    trackNoMap[t.provider] = t.karaokeNo;
  });

  return (
    <Link
      href={`/song/${songId}`}
      className={clsx(
        "flex flex-col gap-3 w-full rounded-2xl px-5 py-4",
        "max-w-[75%]",
        "border border-brand-main",
        "hover:bg-brand-main/5 active:bg-brand-main/10",
        "transition-colors duration-150",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <div className="flex flex-col gap-1">
            <p className="typo-subtitle text-gray-white truncate">
              {titleKo ?? titleInProvider}
            </p>
            <p className="typo-body text-content-primary truncate">
              {titleInProvider}
            </p>
          </div>
          <p className="typo-caption text-content-secondary truncate">
            {artistInProvider}
            {artistKo && ` / ${artistKo}`}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end shrink-0">
          {(["TJ", "KY"] as const).map((provider) => (
            <div key={provider} className="flex items-center gap-2">
              <span
                className={clsx(
                  "typo-label px-2 py-0.5 rounded-md",
                  provider === "TJ"
                    ? "bg-brand-main text-gray-white"
                    : "bg-gray-40 text-content-secondary",
                )}
              >
                {provider}
              </span>
              <span
                className={clsx(
                  "typo-body w-12 text-right",
                  trackNoMap[provider] === "-"
                    ? "text-content-secondary"
                    : "text-gray-white",
                )}
              >
                {trackNoMap[provider]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-brand-main/30 pt-3">
        <p className="typo-tag font-light text-brand-secondary">
          {isInTop100 ? "현재 TOP 100 수록곡이에요" : "TOP 100 미수록곡이에요"}
        </p>
      </div>
    </Link>
  );
}
