"use client";

import { useChartStore } from "@/store/chartStore";
import { ModalSheet } from "../ModalSheet";
import SelectOptionItem from "./SelectOptionItem";

export default function SettingModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    translationScope,
    setTranslationScope,
  } = useChartStore();

  return (
    <ModalSheet
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      headerLabel="설정"
    >
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col items-start gap-1">
          <h5 className="typo-description text-content-primary">
            번역 범위 설정
          </h5>
          <p className="typo-description text-content-secondary">
            제목(일본어·영어)의 번역 범위를 설정합니다.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <SelectOptionItem
            label="일본어만"
            description="영어는 원문 그대로 표시합니다."
            isSelected={translationScope === "jp_only"}
            onClick={() => setTranslationScope("jp_only")}
          />
          <SelectOptionItem
            label="일본어 + 영어 모두 번역"
            description="제목 전체를 한국어로 번역합니다."
            isSelected={translationScope === "full"}
            onClick={() => setTranslationScope("full")}
          />
        </div>
      </div>
    </ModalSheet>
  );
}
