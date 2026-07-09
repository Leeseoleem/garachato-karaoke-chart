"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
// === component ===
import SearchHeader from "@/components/common/headers/SearchHeader";
import SearchSuggestionOverlay from "./SearchSuggestionOverlay";

export default function SearchSection() {
  const navigate = useNavigate();

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
    navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
  };

  useEffect(() => {
    if (!searchText) return;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc("search_songs", {
          query: searchText,
        });
        if (error || isCancelled) return;
        // 정확 포함 결과가 있으면 그것만, 없으면 유사(퍼지) 결과를 폴백으로 제안한다
        const rows: {
          title_ko_jp: string | null;
          title_in_provider: string;
          is_exact: boolean;
        }[] = data ?? [];
        const exactRows = rows.filter((r) => r.is_exact);
        const keywords: string[] = (exactRows.length > 0 ? exactRows : rows).map(
          (item) => item.title_ko_jp ?? item.title_in_provider,
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
