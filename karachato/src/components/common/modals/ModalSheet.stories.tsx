import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { ModalSheet } from "./ModalSheet";

const meta: Meta<typeof ModalSheet> = {
  title: "UI/Modals/ModalSheet",
  component: ModalSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ModalSheet>;

function ModalSheetWrapper({
  headerLabel,
  children,
}: {
  headerLabel: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center justify-center h-screen">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setIsOpen(true)}
      >
        모달 열기
      </button>
      <ModalSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        headerLabel={headerLabel}
      >
        {children}
      </ModalSheet>
    </div>
  );
}

// 1. 내용 짧음 → content 높이만큼
export const Short: Story = {
  render: () => (
    <ModalSheetWrapper headerLabel="기본 모달">
      <div className="p-5">
        <p className="text-white">짧은 내용입니다.</p>
      </div>
    </ModalSheetWrapper>
  ),
};

// 2. 내용 길어서 스크롤 발생
export const Scrollable: Story = {
  render: () => (
    <ModalSheetWrapper headerLabel="스크롤 모달">
      <div className="p-5 flex flex-col gap-4">
        {Array.from({ length: 30 }).map((_, i) => (
          <p key={i} className="text-white">
            아이템 {i + 1}
          </p>
        ))}
      </div>
    </ModalSheetWrapper>
  ),
};

// 3. 입력창 케이스 (ChatModal 시뮬레이션)
export const WithInput: Story = {
  render: () => (
    <ModalSheetWrapper headerLabel="차토봇">
      <div className="p-5 flex flex-col gap-4">
        <p className="text-white">안녕하세요! 무엇이 궁금하신가요?</p>
        <input
          className="w-full p-3 rounded bg-gray-800 text-white"
          placeholder="메시지를 입력하세요"
        />
      </div>
    </ModalSheetWrapper>
  ),
};
