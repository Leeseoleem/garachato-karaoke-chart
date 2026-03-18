"use client";
import clsx from "clsx";
import { X, Search } from "lucide-react";

export interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}
export default function SearchInput({
  value,
  onChange,
  maxLength,
}: SearchInputProps) {
  const textClass = "typo-body text-gray-white placeholder:text-brand-main/60";
  return (
    <div className="relative">
      <input
        className={clsx(
          "w-full px-5 pr-12 h-13 rounded-full search-border outline-none bg-transparent",
          textClass,
        )}
        placeholder="원하는 곡을 검색해보세요!"
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {value ? (
          <button
            type="button"
            aria-label="검색어 초기화"
            className="flex items-center p-1 rounded-full hover:bg-brand-main/20 active:bg-brand-main/40 transform duration-150 ease-in-out"
            onClick={() => onChange("")}
          >
            <X color="#b294ee" />
          </button>
        ) : (
          <div className="p-1">
            <Search color="#b294ee" />
          </div>
        )}
      </div>
    </div>
  );
}
