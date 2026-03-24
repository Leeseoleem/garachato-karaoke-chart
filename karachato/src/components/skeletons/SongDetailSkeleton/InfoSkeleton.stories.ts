import type { Meta, StoryObj } from "@storybook/nextjs";
import { InfoSkeleton } from "./InfoSkeleton";

const meta: Meta<typeof InfoSkeleton> = {
  component: InfoSkeleton,
  title: "Skeleton/InfoSkeleton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InfoSkeleton>;

export const Default: Story = {};
