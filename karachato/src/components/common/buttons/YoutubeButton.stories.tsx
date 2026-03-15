import type { Meta, StoryObj } from "@storybook/nextjs";
import YoutubeButton from "./YoutubeButton";

const meta: Meta<typeof YoutubeButton> = {
  component: YoutubeButton,
  title: "Components/common/buttons/YoutubeButton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof YoutubeButton>;

export const Default: Story = {
  args: {
    url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  },
};

export const Disabled: Story = {};
