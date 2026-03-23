import type { Meta, StoryObj } from "@storybook/nextjs";
import Divider from "./Divider";

const meta: Meta<typeof Divider> = {
  component: Divider,
  title: "Common/Divider",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {};
