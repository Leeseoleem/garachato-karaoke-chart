"use client";
import clsx from "clsx";

interface SelectOptionItemProps {
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function SelectOptionItem({
  label,
  description,
  isSelected,
  onClick,
}: SelectOptionItemProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={clsx(
        "flex flex-row items-start gap-4 w-full rounded-xl border-2 px-4 pt-3.5 pb-3",
        isSelected
          ? "bg-gray-20 border-brand-main" // 선택된 상태
          : "bg-gray-20 border-gray-20", // 선택 안 된 상태
      )}
    >
      {/* 라디오 버튼 */}
      <div
        className={clsx(
          "shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-2",
          isSelected
            ? "border-brand-main" // 선택: 테두리 색상 변경
            : "border-brand-main/60", // 미선택: 불투명도
        )}
      >
        {/* 선택 시 안쪽 채워진 원 */}
        {isSelected && (
          <div className="w-2.5 h-2.5 rounded-full bg-brand-main" />
        )}
      </div>
      <div className="flex flex-col gap-1 items-start">
        <p className="typo-caption text-content-primary">{label}</p>
        <p className="typo-label text-content-secondary">{description}</p>
      </div>
    </button>
  );
}
