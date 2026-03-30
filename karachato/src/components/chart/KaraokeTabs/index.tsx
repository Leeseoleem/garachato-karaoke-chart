"use client";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
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
    if (value === activeTab) return; // 이미 활성화된 탭 클릭 시 무시
    if (value === "KY") {
      toast("금영 노래방은 아직 준비중이에요!", { icon: "🚧" });
      return;
    }
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
