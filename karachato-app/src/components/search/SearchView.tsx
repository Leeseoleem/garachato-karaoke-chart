"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchHeader from "@/components/common/headers/SearchHeader";

export default function SearchView({ initialQuery }: { initialQuery: string }) {
  const [searchText, setSearchText] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!searchText.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchText)}`);
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
