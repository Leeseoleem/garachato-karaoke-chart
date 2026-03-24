import type { Meta, StoryObj } from "@storybook/nextjs";
import { SearchResultItemSkeleton } from "./SearchResultSkeleton";

const meta: Meta<typeof SearchResultItemSkeleton> = {
  component: SearchResultItemSkeleton,
  title: "Skeleton/SearchResultItemSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchResultItemSkeleton>;

export const Default: Story = {};
