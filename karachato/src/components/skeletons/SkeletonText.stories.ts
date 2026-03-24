import type { Meta, StoryObj } from "@storybook/nextjs";
import { SkeletonText } from "./SkeletonText";

const meta: Meta<typeof SkeletonText> = {
  component: SkeletonText,
  title: "Skeleton/SkeletonText",
  tags: ["autodocs"],
  args: {
    className: "w-[150px] h-[20px]",
  },
};

export default meta;
type Story = StoryObj<typeof SkeletonText>;

export const Default: Story = {};

export const Elevated: Story = {
  args: {
    elevated: true,
  },
};
