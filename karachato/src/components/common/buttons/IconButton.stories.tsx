import type { Meta, StoryObj } from "@storybook/nextjs";
import IconButton from "./IconButton";
import { Settings } from "lucide-react";

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  title: "common/buttons/IconButton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Setting: Story = {
  args: {
    icon: <Settings />,
    onClick: () => {},
    ariaLabel: "설정",
  },
};
