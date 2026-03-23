import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import SelectOptionItem from "./SelectOptionItem";

const meta: Meta<typeof SelectOptionItem> = {
  title: "UI/SelectOptionItem",
  component: SelectOptionItem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SelectOptionItem>;

// 1. 미선택 상태
export const Default: Story = {
  args: {
    label: "일본어만",
    description: "영어는 원문 그대로 표시합니다.",
    isSelected: false,
    onClick: () => {},
  },
};

// 2. 선택된 상태
export const Selected: Story = {
  args: {
    label: "일본어 + 영어 모두 번역",
    description: "제목 전체를 번역합니다.",
    isSelected: true,
    onClick: () => {},
  },
};

// 3. 실제 토글 동작 확인용
function SelectOptionGroup() {
  const [selected, setSelected] = useState<"jp" | "both">("both");

  return (
    <div className="flex flex-col gap-3 w-80">
      <SelectOptionItem
        label="일본어만"
        description="영어는 원문 그대로 표시합니다."
        isSelected={selected === "jp"}
        onClick={() => setSelected("jp")}
      />
      <SelectOptionItem
        label="일본어 + 영어 모두 번역"
        description="제목 전체를 번역합니다."
        isSelected={selected === "both"}
        onClick={() => setSelected("both")}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <SelectOptionGroup />,
};
