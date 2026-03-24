import type { Meta, StoryObj } from "@storybook/nextjs";
import KaraokeBadge from "./KaraokeBadge";

const meta: Meta<typeof KaraokeBadge> = {
  component: KaraokeBadge,
  title: "common/badges/KaraokeBadge",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KaraokeBadge>;

export const TJ: Story = {
  args: { provider: "TJ" },
};

export const KY: Story = {
  args: { provider: "KY" },
};
