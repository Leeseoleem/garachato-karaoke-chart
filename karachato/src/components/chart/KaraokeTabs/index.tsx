"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// === component ===
import TabItem from "./TabItem";

// === type ===
import type { KaraokeProvider } from "@/types/domain";
import type { Position } from "./TabItem";

const tabs: { label: string; value: KaraokeProvider; position: Position }[] = [
  { label: "TJ 노래방", value: "TJ", position: "left" },
  { label: "금영", value: "KY", position: "right" },
];

export default function KaraokeTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<KaraokeProvider>("TJ");

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
