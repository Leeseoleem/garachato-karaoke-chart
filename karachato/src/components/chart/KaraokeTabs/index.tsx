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
  const initialProvider: KaraokeProvider =
    providerParam && isKaraokeProvider(providerParam) ? providerParam : "TJ";
  const [activeTab, setActiveTab] = useState<KaraokeProvider>(initialProvider);

  const handleTabClick = (value: KaraokeProvider) => {
    setActiveTab(value);
    router.push(`?provider=${value}`);
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
