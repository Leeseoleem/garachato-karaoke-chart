import type { Meta, StoryObj } from "@storybook/nextjs";
import ChatButton from "./ChatButton";

const meta: Meta<typeof ChatButton> = {
  component: ChatButton,
  title: "common/ChatButton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatButton>;

export const Default: Story = {};
