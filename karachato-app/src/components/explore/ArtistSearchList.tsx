"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { ArtistRow } from "./ArtistList";
import type { ArtistItem } from "@/lib/explore/queries";

// 가수 전체 목록 + 이름 검색(실시간 필터). 타이틀·검색창 고정, 리스트만 스크롤.
export default function ArtistSearchList({
  title,
  artists,
}: {
  title: string;
  artists: ArtistItem[];
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? artists.filter(
        (a) =>
          a.artistKo.toLowerCase().includes(query) ||
          a.artistNorm.toLowerCase().includes(query),
      )
    : artists;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h2 className="shrink-0 px-5 pb-2 pt-6 text-[22px] font-light leading-tight tracking-[-0.02em] text-content-primary">
        {title}
      </h2>
      <div className="shrink-0 px-5 pb-3">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-10"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="가수 이름 검색"
            className="typo-body w-full rounded-full border border-white/[0.07] bg-gray-40 py-3 pl-10 pr-4 text-gray-white outline-none placeholder:text-gray-10 focus:border-brand-main/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {filtered.length === 0 ? (
          <p className="typo-caption px-5 py-10 text-center text-content-secondary">
            검색 결과가 없어요
          </p>
        ) : (
          <div className="px-5">
            {filtered.map((a) => (
              <ArtistRow key={a.artistNorm} artist={a} query={q.trim()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
