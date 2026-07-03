"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchHeader from "@/components/common/headers/SearchHeader";

export default function SearchView({ initialQuery }: { initialQuery: string }) {
  const [searchText, setSearchText] = useState(initialQuery);
  const navigate = useNavigate();

  // q가 외부(뒤로가기/앞으로가기 등)로 바뀌면 입력창도 동기화 (입력값≠결과 어긋남 방지)
  useEffect(() => {
    setSearchText(initialQuery);
  }, [initialQuery]);

  const handleSubmit = () => {
    const q = searchText.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
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
