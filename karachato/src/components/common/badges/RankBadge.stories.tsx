import type { Meta, StoryObj } from "@storybook/nextjs";
import RankBadge from "./RankBadge";

const meta: Meta<typeof RankBadge> = {
  component: RankBadge,
  title: "common/badges/RankBadge",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RankBadge>;

export const Up: Story = {
  args: { status: "UP" },
};

export const Down: Story = {
  args: { status: "DOWN" },
};

export const Same: Story = {
  args: { status: "SAME" },
};

export const New: Story = {
  args: { status: "NEW" },
};

export const Unknown: Story = {
  args: { status: "UNKNOWN" },
};
