import type { Meta, StoryObj } from "@storybook/nextjs";
import QuickQuestions from "./QuickQuestions";

const meta: Meta<typeof QuickQuestions> = {
  title: "UI/Chat/QuickQuestions",
  component: QuickQuestions,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof QuickQuestions>;

// 1. 기본 (랜덤이라 매번 다른 버튼 확인용)
export const Default: Story = {
  args: {
    onSelect: (question) => console.log("선택된 질문:", question),
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-gray-30 p-4 rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

// 2. 클릭 동작 확인용
export const WithAlert: Story = {
  args: {
    onSelect: (question) => alert(`전송: ${question}`),
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-gray-30 p-4 rounded-2xl">
        <Story />
      </div>
    ),
  ],
};
