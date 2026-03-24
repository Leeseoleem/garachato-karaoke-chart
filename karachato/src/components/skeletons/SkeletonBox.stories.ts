import type { Meta, StoryObj } from "@storybook/nextjs";
import { SkeletonBox } from "./SkeletonBox";

const meta: Meta<typeof SkeletonBox> = {
  component: SkeletonBox,
  title: "Skeleton/SkeletonBox",
  tags: ["autodocs"],
  args: {
    className: "w-[150px] h-[60px]",
  },
};

export default meta;
type Story = StoryObj<typeof SkeletonBox>;

export const Default: Story = {};

export const Elevated: Story = {
  args: {
    elevated: true,
  },
};
