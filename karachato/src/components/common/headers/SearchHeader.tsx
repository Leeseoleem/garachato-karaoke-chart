// === component ===
import Header from "./Header";
import BackButton from "./BackButton";
import SearchInput, {
  type SearchInputProps,
} from "@/components/search/SearchInput";
import ChatButton from "../buttons/ChatButton";

type Mode = "default" | "search";

interface SearchHeaderProps {
  mode?: Mode;
  search: SearchInputProps;
}

export default function SearchHeader({
  mode = "default",
  search,
}: SearchHeaderProps) {
  return (
    <Header className="gap-3 h-25">
      {mode === "search" && (
        <div className="shrink-0">
          <BackButton />
        </div>
      )}
      <div className="flex-1">
        <SearchInput {...search} />
      </div>
      {mode === "default" && (
        <div className="shrink-0">
          <ChatButton />
        </div>
      )}
    </Header>
  );
}
