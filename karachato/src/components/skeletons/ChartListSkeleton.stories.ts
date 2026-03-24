import type { Meta, StoryObj } from "@storybook/nextjs";
import { ChartListSkeleton } from "./ChartListSkeleton";

const meta: Meta<typeof ChartListSkeleton> = {
  component: ChartListSkeleton,
  title: "Skeleton/ChartListSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChartListSkeleton>;

export const Default: Story = {};
