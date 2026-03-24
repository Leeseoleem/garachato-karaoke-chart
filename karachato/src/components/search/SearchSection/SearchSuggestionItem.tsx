import Link from "next/link";
import { Search } from "lucide-react";

interface SearchSuggestionItemProps {
  keyword: string;
}

export default function SearchSuggestionItem({
  keyword,
}: SearchSuggestionItemProps) {
  return (
    <Link
      href={`/search?q=${encodeURIComponent(keyword)}`}
      className="flex items-center h-12 px-6 gap-4 hover:bg-gray-40 active:bg-gray-30 transition-colors duration-150"
    >
      <Search size={16} color="#7C5CBF" strokeWidth={1.5} absoluteStrokeWidth />
      <p className="typo-body text-content-muted">{keyword}</p>
    </Link>
  );
}
