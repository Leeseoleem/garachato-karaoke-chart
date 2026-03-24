import type { Meta, StoryObj } from "@storybook/nextjs";
import { SongDetailSkeleton } from ".";

const meta: Meta<typeof SongDetailSkeleton> = {
  component: SongDetailSkeleton,
  title: "Skeleton/Page/SongDetailSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SongDetailSkeleton>;

export const Default: Story = {};
