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
  const [fetchedKeywords, setFetchedKeywords] = useState<string[] | undefined>(
    undefined,
  );

  const keywords = searchText ? fetchedKeywords : undefined;

  useEffect(() => {
    if (!searchText) return;

    const timer = setTimeout(async () => {
      // TODO: feat/search-api — Server Action 또는 route handler로 Supabase 검색 연동
      // const res = await fetch(`/api/search?q=${encodeURIComponent(searchText)}`);
      // const data = await res.json();
      // setFetchedKeywords(data.keywords);
      setFetchedKeywords(MOCK_KEYWORDS.filter((k) => k.includes(searchText)));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <div className="relative">
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
