"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// === component ===
import TabItem from "./TabItem";

// === function ===
import { isKaraokeProvider } from "@/utils/type";

// === type ===
import type { KaraokeProvider } from "@/types/domain";
import type { Position } from "./TabItem";

const tabs: { label: string; value: KaraokeProvider; position: Position }[] = [
  { label: "TJ 노래방", value: "TJ", position: "left" },
  { label: "금영", value: "KY", position: "right" },
];

export default function KaraokeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerParam = searchParams.get("provider");

  // URL을 단일 source of truth로 사용
  const activeTab: KaraokeProvider =
    providerParam && isKaraokeProvider(providerParam) ? providerParam : "TJ";

  const handleTabClick = (value: KaraokeProvider) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("provider", value);
    router.push(`?${nextParams.toString()}`);
  };

  return (
    <div className="flex flex-row h-13 bg-gray-40">
      {tabs.map((tab) => (
        <TabItem
          key={tab.value}
          label={tab.label}
          position={tab.position}
          isActive={activeTab === tab.value}
          onClick={() => handleTabClick(tab.value)}
        />
      ))}
    </div>
  );
}
