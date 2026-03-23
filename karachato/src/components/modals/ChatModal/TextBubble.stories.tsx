import type { Meta, StoryObj } from "@storybook/nextjs";
import { TextBubble } from "./TextBubble";

const meta: Meta<typeof TextBubble> = {
  title: "UI/Chat/TextBubble",
  component: TextBubble,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TextBubble>;

// 1. 사용자 - 짧은 텍스트
export const UserShort: Story = {
  args: {
    role: "user",
    content: "요아소비 찾아줘",
  },
};

// 2. 사용자 - 긴 텍스트
export const UserLong: Story = {
  args: {
    role: "user",
    content: "빠르고 신나는 느낌의 요아소비 노래인데 제목은 잘 모르겠어",
  },
};

// 3. AI - 짧은 텍스트
export const ModelShort: Story = {
  args: {
    role: "model",
    content: "어떤 곡인가요?",
  },
};

// 4. AI - 긴 텍스트
export const ModelLong: Story = {
  args: {
    role: "model",
    content:
      "안녕하세요! 어떤 노래를 찾고 계세요? 차토봇이 딱 맞는 곡 찾아드릴게요.",
  },
};

// 5. 실제 대화 흐름 확인용
export const Conversation: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <TextBubble role="model" content="안녕하세요! 어떤 노래를 찾고 계세요?" />
      <TextBubble role="user" content="요아소비 노래 찾아줘" />
      <TextBubble
        role="model"
        content="어떤 느낌의 곡인가요? 빠른 곡인가요, 잔잔한 곡인가요?"
      />
      <TextBubble role="user" content="빠르고 신나는 느낌의 곡이야" />
    </div>
  ),
};
