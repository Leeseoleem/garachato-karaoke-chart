import type { Meta, StoryObj } from "@storybook/nextjs";
import { MainPageSkeleton } from "./MainPageSkeleton";

const meta: Meta<typeof MainPageSkeleton> = {
  component: MainPageSkeleton,
  title: "Skeleton/Page/MainPageSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MainPageSkeleton>;

export const Default: Story = {};
