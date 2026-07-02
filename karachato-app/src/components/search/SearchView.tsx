"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchHeader from "@/components/common/headers/SearchHeader";

export default function SearchView({ initialQuery }: { initialQuery: string }) {
  const [searchText, setSearchText] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = () => {
    if (!searchText.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchText)}`);
  };

  return (
    <SearchHeader
      mode="search"
      search={{
        value: searchText,
        onChange: setSearchText,
        onSubmit: handleSubmit,
      }}
    />
  );
}
