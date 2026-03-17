import type { Meta, StoryObj } from "@storybook/nextjs";
import IconButton from "./IconButton";
import { Settings } from "lucide-react";

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  title: "Components/common/buttons/Settings",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Setting: Story = {
  args: {
    icon: <Settings />,
  },
};
