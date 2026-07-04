import { ChevronLeft } from "lucide-react";
import { SearchResultItemSkeleton } from "../SearchResultSkeleton";

export function SearchPageSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-row w-full h-25 px-4 items-center gap-3">
        <ChevronLeft size={24} color="#B294EE" />
        <div className="w-full px-5 pr-12 h-13 rounded-full search-border outline-none bg-transparent" />
      </div>
      <div className="flex flex-row justify-between items-center py-4 px-5">
        <p className="typo-description text-content-secondary">
          검색 결과를 불러오는 중...
        </p>
        <p
          className="typo-description text-content-secondary"
          aria-hidden="true"
        >
          0개의 결과
        </p>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <SearchResultItemSkeleton key={i} />
      ))}
    </div>
  );
}
