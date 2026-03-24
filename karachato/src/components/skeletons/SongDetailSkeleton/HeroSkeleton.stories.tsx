import type { Meta, StoryObj } from "@storybook/nextjs";
import { HeroSkeleton } from "./HeroSkeleton";

const meta: Meta<typeof HeroSkeleton> = {
  component: HeroSkeleton,
  title: "Skeleton/HeroSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeroSkeleton>;

export const Default: Story = {};
