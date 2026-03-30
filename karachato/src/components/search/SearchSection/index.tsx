"use client";
import { useState, useEffect } from "react";
// === component ===
import SearchHeader from "@/components/common/headers/SearchHeader";
import SearchSuggestionOverlay from "./SearchSuggestionOverlay";

const MOCK_KEYWORDS = [
  "체인소맨",
  "米津玄師",
  "YOASOBI",
  "베텔기우스",
  "시부야가와",
];

export default function SearchSection() {
  const [searchText, setSearchText] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [fetchResult, setFetchResult] = useState<
    | {
        query: string;
        keywords: string[];
      }
    | undefined
  >(undefined);

  // 현재 searchText와 결과를 가져온 쿼리가 일치할 때만 표시
  const keywords =
    searchText && fetchResult?.query === searchText
      ? fetchResult.keywords
      : undefined;

  useEffect(() => {
    if (!searchText) return;

    const timer = setTimeout(() => {
      // TODO: feat/search-api — Server Action 또는 route handler로 Supabase 검색 연동
      setFetchResult({
        query: searchText,
        keywords: MOCK_KEYWORDS.filter((k) => k.includes(searchText)),
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <div className="relative shrink-0">
      <SearchHeader
        mode="default"
        search={{
          value: searchText,
          onChange: setSearchText,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
      />
      {isFocused && <SearchSuggestionOverlay keywords={keywords} />}
    </div>
  );
}
