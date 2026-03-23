import type { Meta, StoryObj } from "@storybook/nextjs";
import ChatActionButton from "./ChatActionButton";

const meta: Meta<typeof ChatActionButton> = {
  title: "UI/Chat/ChatActionButton",
  component: ChatActionButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ChatActionButton>;

export const Primary: Story = {
  args: {
    variant: "primary",
    onClick: () => console.log("맞아요 클릭"),
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-30 p-4 rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    onClick: () => console.log("아니에요 클릭"),
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-30 p-4 rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export const Retry: Story = {
  args: {
    variant: "retry",
    onClick: () => console.log("다시 시도 클릭"),
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-30 p-4 rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export const ConfirmPair: Story = {
  render: () => (
    <div className="flex gap-2">
      <ChatActionButton
        variant="primary"
        onClick={() => console.log("맞아요 클릭")}
      />
      <ChatActionButton
        variant="secondary"
        onClick={() => console.log("아니에요 클릭")}
      />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="bg-gray-30 p-4 rounded-2xl">
        <Story />
      </div>
    ),
  ],
};
