"use client";
import { useState } from "react";
import { Mic } from "lucide-react";

import type { SearchResult } from "@/types/database";

import SearchResultItem from "./SearchResultItem";

export default function SearchResultSection({
  results,
}: {
  results: SearchResult[];
}) {
  const [isTranslated, setIsTranslated] = useState(true);

  if (results.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <p className="typo-description text-content-primary py-4 px-5">
          검색 결과 없음
        </p>
        <div className="flex flex-col items-center justify-center gap-3 pt-24">
          <Mic size={80} className="text-gray-10" strokeWidth={1.2} />
          <div className="flex flex-col text-center gap-1">
            <p className="typo-title text-content-primary">
              곡을 찾을 수 없어요...
            </p>
            <p className="typo-caption text-content-secondary">
              다른 검색어를 입력해 보세요
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        const firstTrack = result.karaoke_tracks[0];
        if (!firstTrack) return null;
        return (
          <SearchResultItem
            key={result.id}
            title={
              isTranslated
                ? (result.title_ko ?? firstTrack.title_in_provider)
                : firstTrack.title_in_provider
            }
            artist={
              isTranslated
                ? (result.artist_ko ?? firstTrack.artist_in_provider)
                : firstTrack.artist_in_provider
            }
            tracks={result.karaoke_tracks.map((track) => ({
              provider: track.provider,
              karaokeNo: track.karaoke_no,
            }))}
            songId={result.id}
          />
        );
      })}
    </div>
  );
}
