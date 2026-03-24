import type { Meta, StoryObj } from "@storybook/nextjs";
import { SearchPageSkeleton } from "./SearchPageSkeleton";

const meta: Meta<typeof SearchPageSkeleton> = {
  component: SearchPageSkeleton,
  title: "Skeleton/Page/SearchPageSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchPageSkeleton>;

export const Default: Story = {};
