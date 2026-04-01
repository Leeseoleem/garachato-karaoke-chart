"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// === component ===
import SearchHeader from "@/components/common/headers/SearchHeader";
import SearchSuggestionOverlay from "./SearchSuggestionOverlay";

export default function SearchSection() {
  const router = useRouter();

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

  const handleSubmit = () => {
    if (!searchText.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
  };

  useEffect(() => {
    if (!searchText) return;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchText)}`,
        );
        if (!res.ok || isCancelled) return;
        const data = await res.json();
        const keywords: string[] = (data.results ?? []).map(
          (item: { title_ko_jp: string | null; title_in_provider: string }) =>
            item.title_ko_jp ?? item.title_in_provider,
        );
        if (!isCancelled) {
          setFetchResult({
            query: searchText,
            keywords: [...new Set(keywords)],
          });
        }
      } catch (error) {
        console.error("[SearchSection] fetch error:", error);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
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
          onSubmit: handleSubmit,
        }}
      />
      {isFocused && <SearchSuggestionOverlay keywords={keywords} />}
    </div>
  );
}
