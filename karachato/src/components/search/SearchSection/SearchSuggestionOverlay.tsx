import SearchSuggestionItem from "./SearchSuggestionItem";

interface SearchSuggestionOverlayProps {
  keywords?: string[];
}

export default function SearchSuggestionOverlay({
  keywords,
}: SearchSuggestionOverlayProps) {
  if (!keywords) return null;

  return (
    <div className="fixed top-25 inset-x-0 bottom-0 z-10">
      {/* 오버레이 영역 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      {/* 검색 리스트 */}
      {keywords.length > 0 && (
        <ul className="relative z-10">
          {keywords.map((keyword) => (
            <SearchSuggestionItem key={keyword} keyword={keyword} />
          ))}
        </ul>
      )}
    </div>
  );
}
