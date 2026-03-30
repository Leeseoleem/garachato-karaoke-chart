"use client";
import { useState } from "react";

import type { SearchResult } from "@/types/database";
import { KaraokeProvider } from "@/types/domain";

import SearchResultItem from "./SearchResultItem";

export default function SearchResultSection({
  results,
}: {
  results: SearchResult[];
}) {
  const [isTranslated, setIsTranslated] = useState(true);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-row justify-between items-center py-4 px-5">
        <p className="typo-description text-content-primary">
          {results.length}개의 결과
        </p>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isTranslated}
            onChange={(e) => setIsTranslated(e.target.checked)}
            className="form-checkbox h-4 w-4 accent-brand-main"
          />
          <span className="typo-caption text-gray-white">번역된 제목 보기</span>
        </label>
      </div>
      {results.map((result) => {
        return (
          <SearchResultItem
            key={result.id}
            title={
              isTranslated
                ? (result.title_ko ??
                  result.karaoke_tracks[0].title_in_provider)
                : result.karaoke_tracks[0].title_in_provider
            }
            artist={
              isTranslated
                ? (result.artist_ko ??
                  result.karaoke_tracks[0].artist_in_provider)
                : result.karaoke_tracks[0].artist_in_provider
            }
            tracks={result.karaoke_tracks.map((track) => ({
              provider: track.provider as KaraokeProvider,
              karaokeNo: track.karaoke_no,
            }))}
            songId={result.id}
          />
        );
      })}
    </div>
  );
}
