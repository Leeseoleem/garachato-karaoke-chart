import type { Meta, StoryObj } from "@storybook/nextjs";
import { RankCardSkeleton } from "./RankCardSkeleton";

const meta: Meta<typeof RankCardSkeleton> = {
  component: RankCardSkeleton,
  title: "Skeleton/RankCardSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RankCardSkeleton>;

export const Default: Story = {};
