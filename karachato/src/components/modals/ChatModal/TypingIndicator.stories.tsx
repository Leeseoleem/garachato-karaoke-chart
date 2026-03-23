import type { Meta, StoryObj } from "@storybook/nextjs";
import TypingIndicator from "./TypingIndicator";

const meta: Meta<typeof TypingIndicator> = {
  title: "UI/Chat/TypingIndicator",
  component: TypingIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TypingIndicator>;

export const Default: Story = {};

export const WithContext: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <div className="bg-gray-20 rounded-2xl rounded-bl-sm px-3 py-2 text-sm w-fit">
        이 노래 맞나요?
      </div>
      <TypingIndicator />
    </div>
  ),
};
