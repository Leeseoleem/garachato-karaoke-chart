"use client";
import { useNavigate, useSearchParams } from "react-router-dom";
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

export default function KaraokeTabs({
  onScrollToTop,
}: {
  onScrollToTop: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerParam = searchParams.get("provider");

  // URL을 단일 source of truth로 사용
  const activeTab: KaraokeProvider =
    providerParam && isKaraokeProvider(providerParam) ? providerParam : "TJ";

  const handleTabClick = (value: KaraokeProvider) => {
    onScrollToTop();

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("provider", value);
    navigate(`?${nextParams.toString()}`);
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
